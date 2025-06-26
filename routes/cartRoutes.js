const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { Types } = require('mongoose');

// Middleware to check authentication
function checkAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Non authentifié' });
}

// Remove a book from the cart
router.post('/remove', checkAuth, async (req, res) => {
  const userId = req.user._id;
  const { bookId } = req.body;
  if (!Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'ID de livre invalide' });
  }
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Panier non trouvé' });
    const initialLength = cart.books.length;
    cart.books = cart.books.filter(item => item.book.toString() !== bookId);
    if (cart.books.length === initialLength) {
      return res.status(404).json({ message: 'Livre non trouvé dans le panier' });
    }
    await cart.save();
    res.json({ message: 'Livre supprimé du panier' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
