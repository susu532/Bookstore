const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
const Book = require('./models/Book'); // Import Book model

dotenv.config();
const app = express();

// Session & Passport setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'library_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Serve book images from /public/images/books at /images/books
app.use('/images/books', express.static(path.join(__dirname, 'public/images/books')));
// Serve avatar images from /public/uploads/avatars at /uploads/avatars
app.use('/uploads/avatars', express.static(path.join(__dirname, 'public/uploads/avatars')));

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connexion à MongoDB et création d'un admin par défaut
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/books', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB connecté');
  const adminExists = await User.findOne({ email: 'AdminAdmin@gmail.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin1', 10);
    const admin = new User({
      name: 'Administrateur',
      email: 'AdminAdmin@gmail.com',
      password: 'Admin1',
      role: 1,
      isActive: true
    });
    await admin.save();
    console.log('Utilisateur admin créé avec email: AdminAdmin@gmail.com, mot de passe: Admin1');
  } else {
    console.log('Admin déjà existant:', adminExists);
  }
}).catch(err => console.log('Erreur de connexion MongoDB :', err));

// Routes API
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/emprunts', require('./routes/empruntRoutes'));
app.use('/api/books', require('./routes/bookUploadRoutes'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/cart', require('./routes/cartRoutes'));

// Auth middleware for protected routes
const checkAuth = (req, res, next) => {
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) return next();
  return res.redirect('/login');
};

// Admin check middleware
const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 1) return res.status(403).render('error', { message: 'Accès refusé', user: req.user || null });
  next();
};

// Login route (POST)
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('login', { error: 'Utilisateur non trouvé', user: null });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render('login', { error: 'Mot de passe incorrect', user: null });
  req.login(user, err => {
    if (err) return next(err);
    return res.redirect('/dashboard');
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// Routes Frontend
app.get('/', (req, res) => res.render('home', { user: req.user || null }));
app.get('/login', (req, res) => res.render('login', { user: req.user || null, error: null }));
app.get('/register', (req, res) => res.render('register', { user: req.user || null }));
app.get('/profile', checkAuth, (req, res) => res.render('profile', { user: req.user }));
app.get('/books', async (req, res) => {
  const books = await require('./models/Book').find({ stock: { $gt: 0 } });
  res.render('books', { books, user: req.user || null });
});
app.get('/book/:bookId', async (req, res) => {
  const book = await require('./models/Book').findById(req.params.bookId);
  res.render('book', { book, user: req.user || null });
});
app.get('/cart', checkAuth, async (req, res) => {
  const cart = await require('./models/Cart').findOne({ user: req.user._id }).populate('books.book');
  res.render('cart', { cart: cart || { books: [] }, user: req.user });
});
app.get('/orders', checkAuth, async (req, res) => {
  const orders = await require('./models/Order').find({ user: req.user._id }).populate('books.book');
  res.render('orders', { orders, user: req.user });
});
app.get('/dashboard', checkAuth, (req, res) => res.render('dashboard', { user: req.user }));
app.get('/books/manage', checkAuth, checkAdmin, async (req, res) => {
  const books = await require('./models/Book').find();
  res.render('books/manage', { user: req.user, books });
});
app.get('/orders/manage', checkAuth, async (req, res) => {
  const cart = await require('./models/Cart').findOne({ user: req.user._id }).populate('books.book');
  const orders = await require('./models/Order').find({ user: req.user._id }).populate('books.book');
  const books = await require('./models/Book').find({ stock: { $gt: 0 } });
  res.render('orders/manage', { user: req.user, cart: cart || { books: [] }, orders, books });
});
// Restrict emprunts page to authenticated users only (not just admin)
app.get('/emprunts', checkAuth, async (req, res) => {
  const Emprunt = require('./models/Emprunt');
  const emprunts = await Emprunt.find({ user: req.user._id }).populate('book');
  res.render('emprunts', { user: req.user, emprunts });
});
// Wishlist page (GET /wishlist)
app.get('/wishlist', checkAuth, async (req, res) => {
  const user = req.user;
  if (!user || !user.wishlist || user.wishlist.length === 0) {
    return res.render('wishlist', { user, wishlistBooks: [] });
  }
  // Populate books in wishlist
  const Book = require('./models/Book');
  const wishlistBooks = await Book.find({ _id: { $in: user.wishlist } });
  res.render('wishlist', { user, wishlistBooks });
});
// Notifications page: show recently added books
app.get('/notifications', (req, res) => {
  res.render('notifications', { user: req.user || null });
});

// Routes Admin
app.get('/admin/users', checkAuth, checkAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.render('admin/users', { users, user: req.user });
});
app.get('/admin/orders', checkAuth, checkAdmin, async (req, res) => {
  const orders = await require('./models/Order').find().populate('user', 'name').populate('books.book');
  res.render('admin/orders', { orders, user: req.user });
});
app.get('/admin/stock', checkAuth, checkAdmin, async (req, res) => {
  const books = await require('./models/Book').find();
  res.render('admin/stock', { books, user: req.user });
});
app.get('/admin/emprunts', checkAuth, checkAdmin, async (req, res) => {
  const Emprunt = require('./models/Emprunt');
  const emprunts = await Emprunt.find().populate('user').populate('book');
  res.render('admin/emprunts', { user: req.user, emprunts });
});
app.get('/admin/reviews', checkAuth, checkAdmin, (req, res) => {
  res.render('admin/reviews', { user: req.user });
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.set('io', io); // Make io accessible in routes

// --- Gamification Real-Time: Track user connections ---
const userSocketMap = new Map(); // userId -> Set of socketIds
app.set('userSocketMap', userSocketMap); // Make userSocketMap accessible in routes

io.on('connection', (socket) => {
  // Listen for user identification from client
  socket.on('identify', (userId) => {
    if (!userId) return;
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);
    socket.userId = userId;
  });

  // Real-time: Send 5 most recent books on request
  socket.on('getRecentBooks', async () => {
    try {
      const books = await Book.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      socket.emit('recentBooks', books);
    } catch (err) {
      socket.emit('recentBooks', []);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId && userSocketMap.has(socket.userId)) {
      userSocketMap.get(socket.userId).delete(socket.id);
      if (userSocketMap.get(socket.userId).size === 0) {
        userSocketMap.delete(socket.userId);
      }
    }
  });
});

// Helper to emit gamification updates to a user
app.emitGamificationUpdate = (userId, gamificationData) => {
  const sockets = userSocketMap.get(String(userId));
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit('gamificationUpdate', gamificationData);
    }
  }
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
