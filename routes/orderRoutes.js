const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Book = require('../models/Book');

// Ajouter au panier
router.post('/cart', async (req, res) => {
  // Utiliser req.user._id si connecté via session
  const userId = req.user ? req.user._id : req.body.userId;
  const { bookId, quantity } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.stock < quantity) return res.status(400).json({ message: 'Stock insuffisant ou livre introuvable' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, books: [] });

    const bookIndex = cart.books.findIndex(b => b.book.toString() === bookId);
    if (bookIndex > -1) cart.books[bookIndex].quantity += parseInt(quantity) || 1;
    else cart.books.push({ book: bookId, quantity: parseInt(quantity) || 1 });

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Erreur lors de l’ajout au panier :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Voir le panier
router.get('/cart', async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const cart = await Cart.findOne({ user: userId }).populate('books.book');
    if (!cart) return res.json({ books: [] });
    res.json(cart);
  } catch (err) {
    console.error('Erreur lors de la récupération du panier :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Valider la commande
router.post('/checkout', async (req, res) => {
  const userId = req.user ? req.user._id : req.body.userId;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('books.book');
    if (!cart || cart.books.length === 0) return res.status(400).json({ message: 'Panier vide' });

    let total = 0;
    for (const item of cart.books) {
      const book = item.book;
      if (book.stock < item.quantity) return res.status(400).json({ message: `Stock insuffisant pour ${book.title}` });
      total += book.price * item.quantity;
      book.stock -= item.quantity;
      await book.save();
    }

    const order = new Order({ user: userId, books: cart.books, total });
    await order.save();
    await Cart.deleteOne({ user: userId });
    res.json({ message: 'Commande validée', orderId: order.id });
  } catch (err) {
    console.error('Erreur lors de la validation de la commande :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Historique des commandes
router.get('/history', async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const orders = await Order.find({ user: userId }).populate('books.book');
    res.json(orders);
  } catch (err) {
    console.error('Erreur lors de la récupération de l’historique :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;