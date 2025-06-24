const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Cart = require('../models/Cart'); // Assuming Cart model is in models/Cart.js

// Helper to emit wishlist updates to a user (using userSocketMap from app.js)
function emitWishlistUpdate(req, userId, count) {
  const io = req.app.get('io');
  const userSocketMap = req.app.get('userSocketMap');
  if (io && userSocketMap) {
    const sockets = userSocketMap.get(String(userId));
    if (sockets) {
      for (const socketId of sockets) {
        io.to(socketId).emit('wishlistUpdate', { userId, count });
      }
    }
  }
}

// POST /api/wishlist/:bookId
router.post('/:bookId', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const bookId = req.params.bookId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    if (!user.wishlist) user.wishlist = [];
    if (!user.wishlist.includes(bookId)) {
      user.wishlist.push(bookId);
      await user.save();
    }
    const count = user.wishlist.length;
    // After saving user, update req.user.wishlist to keep session in sync
    req.user.wishlist = user.wishlist;
    emitWishlistUpdate(req, userId, count);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/wishlist/:bookId
router.delete('/:bookId', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const bookId = req.params.bookId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    if (!user.wishlist) user.wishlist = [];
    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    await user.save();
    const count = user.wishlist.length;
    // After saving user, update req.user.wishlist to keep session in sync
    req.user.wishlist = user.wishlist;
    emitWishlistUpdate(req, userId, count);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/wishlist/:bookId/move-to-cart
router.post('/:bookId/move-to-cart', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const bookId = req.params.bookId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    if (!user.wishlist) user.wishlist = [];
    user.wishlist = user.wishlist.filter(id => id.toString() !== bookId);
    // Add to cart logic (simplified, assumes Cart model exists)
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, books: [] });
    const idx = cart.books.findIndex(b => b.book.toString() === bookId);
    if (idx > -1) cart.books[idx].quantity += 1;
    else cart.books.push({ book: bookId, quantity: 1 });
    await cart.save();
    await user.save();
    const count = user.wishlist.length;
    // After saving user, update req.user.wishlist to keep session in sync
    req.user.wishlist = user.wishlist;
    emitWishlistUpdate(req, userId, count);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;