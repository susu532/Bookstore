const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/books', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connecté');
    // Vérifier si un admin existe, sinon en créer un
    const adminExists = await User.findOne({ email: 'AdminAdmin@gmail.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin', 10);
      const admin = new User({
        name: 'Administrateur',
        email: 'AdminAdmin@gmail.com',
        password: hashedPassword,
        role: 1, // Admin
        isActive: true
      });
      await admin.save();
      console.log('Utilisateur admin créé avec email: AdminAdmin@gmail.com, mot de passe: Admin1');
    }
  })
  .catch(err => console.log(err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Routes Frontend
app.get('/', (req, res) => res.render('home'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/profile', require('./middleware/auth'), async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.render('profile', { user });
});
app.get('/books', async (req, res) => {
  const books = await require('./models/Book').find({ stock: { $gt: 0 } });
  res.render('books', { books });
});
app.get('/book/:bookId', async (req, res) => {
  const book = await require('./models/Book').findById(req.params.bookId);
  res.render('book', { book });
});
app.get('/cart', require('./middleware/auth'), async (req, res) => {
  const cart = await require('./models/Cart').findOne({ user: req.user.id }).populate('books.book');
  res.render('cart', { cart: cart || { books: [] } });
});
app.get('/orders', require('./middleware/auth'), async (req, res) => {
  const orders = await require('./models/Order').find({ user: req.user.id }).populate('books.book');
  res.render('orders', { orders });
});
app.get('/admin/users', [require('./middleware/auth'), (req, res, next) => req.user.role !== 1 ? res.status(403).send('Accès refusé') : next()], async (req, res) => {
  const users = await User.find().select('-password');
  res.render('admin/users', { users });
});
app.get('/admin/orders', [require('./middleware/auth'), (req, res, next) => req.user.role !== 1 ? res.status(403).send('Accès refusé') : next()], async (req, res) => {
  const orders = await require('./models/Order').find().populate('user', 'name').populate('books.book');
  res.render('admin/orders', { orders });
});
app.get('/admin/stock', [require('./middleware/auth'), (req, res, next) => req.user.role !== 1 ? res.status(403).send('Accès refusé') : next()], async (req, res) => {
  const books = await require('./models/Book').find();
  res.render('admin/stock', { books });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));