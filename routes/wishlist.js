const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
  // ...existing code to add book to wishlist...
  // After updating DB:
  const userId = req.user._id.toString();
  const user = await User.findById(userId);
  const count = user.wishlist.length;
  emitWishlistUpdate(req, userId, count);
  res.json({ success: true, count });
});

// DELETE /api/wishlist/:bookId
router.delete('/:bookId', async (req, res) => {
  // ...existing code to remove book from wishlist...
  // After updating DB:
  const userId = req.user._id.toString();
  const user = await User.findById(userId);
  const count = user.wishlist.length;
  emitWishlistUpdate(req, userId, count);
  res.json({ success: true, count });
});

// POST /api/wishlist/:bookId/move-to-cart
router.post('/:bookId/move-to-cart', async (req, res) => {
  // ...existing code to move book from wishlist to cart...
  // After updating DB:
  const userId = req.user._id.toString();
  const user = await User.findById(userId);
  const count = user.wishlist.length;
  emitWishlistUpdate(req, userId, count);
  res.json({ success: true, count });
});

module.exports = router;