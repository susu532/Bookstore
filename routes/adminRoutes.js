const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router;