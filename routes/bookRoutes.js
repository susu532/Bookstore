const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Comment = require('../models/Comment');
const User = require('../models/User');
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

// Ajouter un livre avec image (supporte image URL ou upload direct)
router.post('/', async (req, res) => {
  try {
    // If the request is multipart/form-data, parse it as FormData
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      // Use multer to parse file if present
      upload.single('image')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ message: 'Erreur lors de l\'upload de l\'image' });
        }
        const { title, author, genre, price, description, stock } = req.body;
        let imagePath = req.body.image || '';
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
          const bookObj = book.toObject();
          if (!bookObj.image) bookObj.image = '/images/books/default-cover.png';
          return res.json({ message: 'Livre ajouté avec succès', bookId: book.id, book: bookObj });
        } catch (err) {
          console.error('Erreur lors de l’ajout du livre :', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
      });
    } else {
      // Handle JSON or urlencoded (no file upload, just image URL)
      const { title, author, genre, price, description, stock, image } = req.body;
      const book = new Book({
        title,
        author,
        genre,
        price,
        description,
        stock: stock || 0,
        image: image || ''
      });
      await book.save();
      const bookObj = book.toObject();
      if (!bookObj.image) bookObj.image = '/images/books/default-cover.png';
      return res.json({ message: 'Livre ajouté avec succès', bookId: book.id, book: bookObj });
    }
  } catch (err) {
    console.error('Erreur lors de l’ajout du livre :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un livre (supporte upload image ou image URL)
router.put('/:bookId', async (req, res) => {
  try {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      upload.single('image')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ message: 'Erreur lors de l\'upload de l\'image' });
        }
        const { title, author, genre, price, description, stock } = req.body;
        let imagePath = req.body.image || '';
        if (req.file) {
          imagePath = '/images/books/' + req.file.filename;
        }
        try {
          const book = await Book.findById(req.params.bookId);
          if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
          if (title) book.title = title;
          if (author) book.author = author;
          if (genre) book.genre = genre;
          if (price) book.price = price;
          if (description) book.description = description;
          if (stock !== undefined) book.stock = stock;
          if (imagePath) book.image = imagePath;
          await book.save();
          const bookObj = book.toObject();
          if (!bookObj.image) bookObj.image = '/images/books/default-cover.png';
          return res.json({ message: 'Livre mis à jour avec succès', book: bookObj });
        } catch (err) {
          console.error('Erreur lors de la mise à jour du livre :', err);
          return res.status(500).json({ message: 'Erreur serveur' });
        }
      });
    } else {
      // Handle JSON or urlencoded (no file upload, just image URL)
      const { title, author, genre, price, description, stock, image } = req.body;
      const book = await Book.findById(req.params.bookId);
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      if (title) book.title = title;
      if (author) book.author = author;
      if (genre) book.genre = genre;
      if (price) book.price = price;
      if (description) book.description = description;
      if (stock !== undefined) book.stock = stock;
      if (image) book.image = image;
      await book.save();
      const bookObj = book.toObject();
      if (!bookObj.image) bookObj.image = '/images/books/default-cover.png';
      return res.json({ message: 'Livre mis à jour avec succès', book: bookObj });
    }
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
    let books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    });
    books = books.map(book => {
      book = book.toObject();
      if (!book.image) book.image = '/images/books/default-cover.png';
      return book;
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
    let books = await Book.find();
    books = books.map(book => {
      book = book.toObject();
      if (!book.image) book.image = '/images/books/default-cover.png';
      return book;
    });
    res.json(books);
  } catch (err) {
    console.error('Erreur lors de la récupération des livres :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un livre par ID (API) - placed after all more specific routes
router.get('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    const bookObj = book.toObject();
    if (!bookObj.image) bookObj.image = '/images/books/default-cover.png';
    res.json(bookObj);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un commentaire, une note, un like/dislike
router.post('/:bookId/comment', async (req, res) => {
  if (!req.user || !req.user._id) return res.status(401).json({ message: 'Vous devez être connecté pour commenter.' });
  const { text, rating, like, dislike } = req.body;
  if (!text && !rating && !like && !dislike) {
    return res.status(400).json({ message: 'Le commentaire, la note ou le like/dislike est requis.' });
  }
  try {
    const comment = new Comment({
      book: req.params.bookId,
      user: req.user._id,
      username: req.user.name || req.user.email || 'Utilisateur',
      text: text || '',
      rating,
      like: !!like,
      dislike: !!dislike
    });
    await comment.save();
    // Gamification: add points, level up, and badges
    const user = await User.findById(req.user._id);
    let pointsEarned = 10;
    if (rating) pointsEarned += 5;
    if (like || dislike) pointsEarned += 2;
    user.points += pointsEarned;
    // Level up every 100 points
    if (user.points >= 100) {
      user.level += 1;
      user.points = user.points - 100;
      if (!user.badges.includes('Nouveau niveau')) user.badges.push('Nouveau niveau');
    }
    // Add badges for first comment, first rating, etc.
    if (user.badges.indexOf('💬 Commentateur') === -1 && text) user.badges.push('💬 Commentateur');
    if (user.badges.indexOf('⭐ Critique') === -1 && rating) user.badges.push('⭐ Critique');
    if (user.badges.indexOf('👍 Likeur') === -1 && like) user.badges.push('👍 Likeur');
    if (user.badges.indexOf('👎 Dislikeur') === -1 && dislike) user.badges.push('👎 Dislikeur');
    await user.save();
    res.json({ message: 'Commentaire ajouté', comment, gamification: { points: user.points, level: user.level, badges: user.badges } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Récupérer les commentaires d'un livre
router.get('/:bookId/comments', async (req, res) => {
  try {
    // Populate user to get avatar and name
    const comments = await Comment.find({ book: req.params.bookId })
      .sort({ createdAt: -1 })
      .populate('user', 'avatar name');
    // Map to include avatar in each comment
    const commentsWithAvatar = comments.map(c => ({
      _id: c._id,
      book: c.book,
      user: c.user?._id?.toString() || '',
      username: c.username,
      text: c.text,
      rating: c.rating,
      like: c.like,
      dislike: c.dislike,
      createdAt: c.createdAt,
      avatar: c.user?.avatar || null
    }));
    res.json(commentsWithAvatar);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un commentaire
router.put('/comment/:commentId', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non autorisé' });
  const { text, rating, like, dislike } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (String(comment.user) !== String(req.user._id)) return res.status(403).json({ message: 'Non autorisé' });
    if (text) comment.text = text;
    if (rating) comment.rating = rating;
    comment.like = !!like;
    comment.dislike = !!dislike;
    await comment.save();
    res.json({ message: 'Commentaire modifié', comment });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un commentaire
router.delete('/comment/:commentId', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Non autorisé' });
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });
    if (String(comment.user) !== String(req.user._id)) return res.status(403).json({ message: 'Non autorisé' });
    await comment.deleteOne();
    res.json({ message: 'Commentaire supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Get 5 most recently added books
router.get('/recent', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(5);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;