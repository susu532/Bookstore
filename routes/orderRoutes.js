const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Book = require('../models/Book');

// Ajouter au panier
router.post('/cart', auth, async (req, res) => {
  const { bookId, quantity } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.stock < quantity) return res.status(400).json({ message: 'Stock insuffisant ou livre introuvable' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, books: [] });

    const bookIndex = cart.books.findIndex(b => b.book.toString() === bookId);
    if (bookIndex > -1) cart.books[bookIndex].quantity += quantity || 1;
    else cart.books.push({ book: bookId, quantity: quantity || 1 });

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Voir le panier
router.get('/cart', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('books.book');
    if (!cart) return res.json({ books: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Valider la commande
router.post('/checkout', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('books.book');
    if (!cart || cart.books.length === 0) return res.status(400).json({ message: 'Panier vide' });

    let total = 0;
    for (const item of cart.books) {
      const book = item.book;
      if (book.stock < item.quantity) return res.status(400).json({ message: `Stock insuffisant pour ${book.title}` });
      total += book.price * item.quantity;
      book.stock -= item.quantity;
      await book.save();
    }

    const order = new Order({ user: req.user.id, books: cart.books, total });
    await order.save();
    await Cart.deleteOne({ user: req.user.id });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Historique des commandes
router.get('/history', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('books.book');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;