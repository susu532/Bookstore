const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Emprunt = require('../models/Emprunt');
const Comment = require('../models/Comment');

// --- MODÉRATION DES AVIS ---
// GET all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Comment.find({})
      .populate('book', 'title')
      .populate('user', 'name');
    res.json(reviews.map(r => ({
      _id: r._id,
      bookTitle: r.book && r.book.title ? r.book.title : '',
      username: r.user && r.user.name ? r.user.name : r.username,
      text: r.text,
      rating: r.rating,
      status: r.status || 'pending',
      like: r.like,
      dislike: r.dislike
    })));
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Count pending reviews
router.get('/reviews/count', async (req, res) => {
  try {
    const count = await Comment.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Approve/Reject/Delete review
router.put('/reviews/:id', async (req, res) => {
  try {
    const { action } = req.body;
    const review = await Comment.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Avis non trouvé' });
    if (action === 'approve') review.status = 'approved';
    else if (action === 'reject') review.status = 'rejected';
    await review.save();
    // Socket.io real-time
    req.app.get('io').emit('reviewUpdate');
    res.json({ message: 'Avis modifié' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
router.delete('/reviews/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('reviewUpdate');
    res.json({ message: 'Avis supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Activer/Désactiver un utilisateur
router.patch('/users/:userId', async (req, res) => {
  const { isActive } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    user.isActive = isActive;
    await user.save();
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mise à jour du stock
router.patch('/books/:bookId/stock', async (req, res) => {
  const { stock } = req.body;
  try {
    const book = await require('../models/Book').findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    book.stock = stock;
    await book.save();
    res.json({ message: 'Stock mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Toggle user active status (PUT /admin/users/toggle/:userId)
router.put('/users/toggle/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be boolean' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    user.isActive = isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET all users (for admin panel)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET all orders (for admin panel)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('books.book');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET all books (for admin stock panel)
router.get('/stock', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET all emprunts (for admin panel)
router.get('/emprunts', async (req, res) => {
  try {
    const emprunts = await Emprunt.find({})
      .populate({ path: 'user', select: 'name email', options: { strictPopulate: false } })
      .populate({ path: 'book', select: 'title', options: { strictPopulate: false } });
    res.json(emprunts);
  } catch (err) {
    console.error('Erreur /api/admin/emprunts:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;