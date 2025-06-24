const express = require('express');
const router = express.Router();
const Emprunt = require('../models/Emprunt');
const Book = require('../models/Book');
const User = require('../models/User');

// Créer un emprunt
router.post('/', async (req, res) => {
  // Utiliser req.user._id si connecté via session
  const userId = req.user ? req.user._id : req.body.userId;
  const { bookId } = req.body;
  try {
    // Prevent duplicate borrow
    const already = await Emprunt.findOne({ user: userId, book: bookId, dateRetour: null });
    if (already) return res.status(400).json({ message: 'Déjà emprunté et non retourné.' });
    const book = await Book.findById(bookId);
    if (!book || book.stock < 1) return res.status(400).json({ message: 'Livre non disponible' });
    const emprunt = new Emprunt({ user: userId, book: bookId });
    await emprunt.save();
    book.stock -= 1;
    await book.save();
    // Gamification: add points, level up, and badges
    const user = await User.findById(userId);
    let pointsEarned = 20; // More points for borrowing
    user.points += pointsEarned;
    if (user.points >= 100) {
      user.level += 1;
      user.points = user.points - 100;
      if (!user.badges.includes('Nouveau niveau')) user.badges.push('Nouveau niveau');
    }
    if (user.badges.indexOf('📚 Bookworm') === -1) user.badges.push('📚 Bookworm');
    await user.save();
    res.status(201).json({ message: 'Emprunt créé', emprunt, gamification: { points: user.points, level: user.level, badges: user.badges } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister les emprunts d'un utilisateur
router.get('/user/:userId?', async (req, res) => {
  try {
    // Permet d'utiliser req.user._id si pas de paramètre
    const userId = req.params.userId || (req.user ? req.user._id : null);
    if (!userId) return res.status(400).json({ message: 'Utilisateur non spécifié' });
    const emprunts = await Emprunt.find({ user: userId }).populate('book');
    res.json({ emprunts });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Retourner un livre
router.put('/return/:id', async (req, res) => {
  try {
    const emprunt = await Emprunt.findById(req.params.id).populate('book');
    if (!emprunt || emprunt.dateRetour) return res.status(400).json({ message: 'Emprunt invalide' });
    emprunt.dateRetour = new Date();
    await emprunt.save();
    emprunt.book.stock += 1;
    await emprunt.book.save();
    // Gamification: add points for returning
    const user = await User.findById(emprunt.user);
    let pointsEarned = 10; // Points for returning
    user.points += pointsEarned;
    if (user.points >= 100) {
      user.level += 1;
      user.points = user.points - 100;
      if (!user.badges.includes('Nouveau niveau')) user.badges.push('Nouveau niveau');
    }
    if (user.badges.indexOf('🔄 Retourneur') === -1) user.badges.push('🔄 Retourneur');
    await user.save();
    res.json({ message: 'Livre retourné', emprunt, gamification: { points: user.points, level: user.level, badges: user.badges } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister tous les emprunts (admin)
router.get('/', async (req, res) => {
  try {
    const emprunts = await Emprunt.find().populate('user').populate('book');
    res.json({ emprunts });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Lister les emprunts d'un livre (admin/stat)
router.get('/book/:bookId', async (req, res) => {
  try {
    const emprunts = await Emprunt.find({ book: req.params.bookId }).populate('user');
    res.json({ emprunts });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Emprunts en retard (overdue) pour tous (admin)
router.get('/overdue', async (req, res) => {
  try {
    const limit = 14 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const emprunts = await Emprunt.find({
      dateRetour: null,
      dateEmprunt: { $lt: new Date(now - limit) }
    }).populate('user').populate('book');
    res.json({ emprunts });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Statistiques globales (admin)
router.get('/stats', async (req, res) => {
  try {
    const total = await Emprunt.countDocuments();
    const actifs = await Emprunt.countDocuments({ dateRetour: null });
    const returned = await Emprunt.countDocuments({ dateRetour: { $ne: null } });
    const topBooks = await Emprunt.aggregate([
      { $group: { _id: "$book", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const Book = require('../models/Book');
    for (let b of topBooks) {
      const book = await Book.findById(b._id);
      b.title = book ? book.title : 'Inconnu';
    }
    res.json({ total, actifs, returned, topBooks });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
