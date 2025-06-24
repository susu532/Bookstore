const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');

// Config multer pour upload d'image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/books'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ajouter un livre avec image
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, author, genre, price, description, stock } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/images/books/' + req.file.filename;
  }
  try {
    const book = new Book({
      title,
      author,
      genre,
      price,
      description,
      stock: stock || 0,
      image: imagePath
    });
    await book.save();
    res.json({ message: 'Livre ajouté avec succès', bookId: book.id });
  } catch (err) {
    console.error('Erreur lors de l’ajout du livre :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un livre
router.put('/:bookId', async (req, res) => {
  const { title, author, genre, price, description, stock } = req.body;
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

    if (title) book.title = title;
    if (author) book.author = author;
    if (genre) book.genre = genre;
    if (price) book.price = price;
    if (description) book.description = description;
    if (stock !== undefined) book.stock = stock;
    await book.save();
    res.json({ message: 'Livre mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du livre :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un livre
router.delete('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    await book.deleteOne();
    res.json({ message: 'Livre supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du livre :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Rechercher des livres
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (err) {
    console.error('Erreur lors de la recherche des livres :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les livres
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error('Erreur lors de la récupération des livres :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;