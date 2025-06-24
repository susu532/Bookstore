const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, default: 0 }, // 0: utilisateur normal, 1: admin
  isActive: { type: Boolean, default: true },
  // Gamification fields
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  avatar: { type: String } // Path to avatar image
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);