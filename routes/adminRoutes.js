const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Book = require('../models/Book');

// Vérifier rôle admin
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 1) return res.status(403).json({ message: 'Réservé aux administrateurs' });
  next();
};

// Gestion des utilisateurs (activer/désactiver)
router.patch('/users/:userId', [auth, checkAdmin], async (req, res) => {
  const { isActive } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé' });
    user.isActive = isActive;
    await user.save();
    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des commandes (voir toutes les commandes)
router.get('/orders', [auth, checkAdmin], async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name').populate('books.book');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion du stock
router.patch('/books/:bookId/stock', [auth, checkAdmin], async (req, res) => {
  const { stock } = req.body;
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(400).json({ message: 'Livre non trouvé' });
    book.stock = stock;
    await book.save();
    res.json({ message: 'Stock mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;