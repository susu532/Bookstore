const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

// Routes Frontend
const checkAuth = async (req, res, next) => {
  const userId = req.query.userId;
  if (!userId) return res.redirect('/login');
  const user = await User.findById(userId).select('-password');
  if (!user) return res.redirect('/login');
  req.user = user;
  next();
};

app.get('/', (req, res) => res.render('home', { user: null }));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/profile', checkAuth, (req, res) => res.render('profile', { user: req.user }));
app.get('/books', async (req, res) => {
  const books = await require('./models/Book').find({ stock: { $gt: 0 } });
  res.render('books', { books });
});
app.get('/book/:bookId', async (req, res) => {
  const book = await require('./models/Book').findById(req.params.bookId);
  res.render('book', { book });
});
app.get('/cart', checkAuth, async (req, res) => {
  const cart = await require('./models/Cart').findOne({ user: req.user._id }).populate('books.book');
  res.render('cart', { cart: cart || { books: [] } });
});
app.get('/orders', checkAuth, async (req, res) => {
  const orders = await require('./models/Order').find({ user: req.user._id }).populate('books.book');
  res.render('orders', { orders });
});
app.get('/dashboard', checkAuth, (req, res) => res.render('dashboard', { user: req.user }));
app.get('/books/manage', checkAuth, async (req, res) => {
  const books = await require('./models/Book').find();
  res.render('books/manage', { user: req.user, books });
});
app.get('/orders/manage', checkAuth, async (req, res) => {
  const cart = await require('./models/Cart').findOne({ user: req.user._id }).populate('books.book');
  const orders = await require('./models/Order').find({ user: req.user._id }).populate('books.book');
  const books = await require('./models/Book').find({ stock: { $gt: 0 } });
  res.render('orders/manage', { user: req.user, cart: cart || { books: [] }, orders, books });
});

// Routes Admin
const checkAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== 1) return res.status(403).json({ message: 'Accès refusé' });
  next();
};

app.get('/admin/users', checkAuth, checkAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.render('admin/users', { users });
});
app.get('/admin/orders', checkAuth, checkAdmin, async (req, res) => {
  const orders = await require('./models/Order').find().populate('user', 'name').populate('books.book');
  res.render('admin/orders', { orders });
});
app.get('/admin/stock', checkAuth, checkAdmin, async (req, res) => {
  const books = await require('./models/Book').find();
  res.render('admin/stock', { books });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
