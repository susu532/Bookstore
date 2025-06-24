const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  like: { type: Boolean, default: false },
  dislike: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
