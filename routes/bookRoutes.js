const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Book = require('../models/Book');

// Liste des livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ stock: { $gt: 0 } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Détails d’un livre
router.get('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(400).json({ message: 'Livre non trouvé' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Recherche de livres
router.get('/search', async (req, res) => {
  const { q, genre } = req.query;
  try {
    const query = {};
    if (q) query.$or = [{ title: new RegExp(q, 'i') }, { author: new RegExp(q, 'i') }];
    if (genre) query.genre = genre;
    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un livre (admin uniquement)
router.post('/', auth, [
  check('title', 'Titre requis (2-100 caractères)').isLength({ min: 2, max: 100 }),
  check('author', 'Auteur requis').not().isEmpty(),
  check('genre', 'Genre requis').not().isEmpty(),
  check('price', 'Prix invalide').isFloat({ min: 0 })
], async (req, res) => {
  if (req.user.role !== 1) return res.status(403).json({ message: 'Réservé aux administrateurs' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, author, genre, price, description, stock } = req.body;
  try {
    let book = new Book({ title, author, genre, price, description, stock });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un livre (admin uniquement)
router.patch('/:bookId', auth, async (req, res) => {
  if (req.user.role !== 1) return res.status(403).json({ message: 'Réservé aux administrateurs' });
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(400).json({ message: 'Livre non trouvé' });
    Object.assign(book, req.body);
    await book.save();
    res.json({ message: 'Livre mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un livre (admin uniquement)
router.delete('/:bookId', auth, async (req, res) => {
  if (req.user.role !== 1) return res.status(403).json({ message: 'Réservé aux administrateurs' });
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(400).json({ message: 'Livre non trouvé' });
    await book.remove();
    res.json({ message: 'Livre supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;