const mongoose = require('mongoose');

const empruntSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  dateEmprunt: { type: Date, default: Date.now },
  dateRetour: { type: Date }
});

module.exports = mongoose.model('Emprunt', empruntSchema);
