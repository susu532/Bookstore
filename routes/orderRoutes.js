const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Book = require('../models/Book');
const nodemailer = require('nodemailer');

// Ajouter au panier
router.post('/cart', async (req, res) => {
  // Utiliser req.user._id si connecté via session
  const userId = req.user ? req.user._id : req.body.userId;
  const { bookId, quantity } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.stock < quantity) return res.status(400).json({ message: 'Stock insuffisant ou livre introuvable' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, books: [] });

    const bookIndex = cart.books.findIndex(b => b.book.toString() === bookId);
    if (bookIndex > -1) cart.books[bookIndex].quantity += parseInt(quantity) || 1;
    else cart.books.push({ book: bookId, quantity: parseInt(quantity) || 1 });

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Erreur lors de l’ajout au panier :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Voir le panier
router.get('/cart', async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const cart = await Cart.findOne({ user: userId }).populate('books.book');
    if (!cart) return res.json({ books: [] });
    res.json(cart);
  } catch (err) {
    console.error('Erreur lors de la récupération du panier :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Valider la commande
router.post('/checkout', async (req, res) => {
  const userId = req.user ? req.user._id : req.body.userId;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('books.book');
    if (!cart || cart.books.length === 0) return res.status(400).json({ message: 'Panier vide' });

    let total = 0;
    for (const item of cart.books) {
      const book = item.book;
      if (book.stock < item.quantity) return res.status(400).json({ message: `Stock insuffisant pour ${book.title}` });
      total += book.price * item.quantity;
      book.stock -= item.quantity;
      await book.save();
    }

    const order = new Order({ user: userId, books: cart.books, total });
    await order.save();
    await Cart.deleteOne({ user: userId });

    // Gamification: add points and badge for order
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      user.points += 20; // +20 points for an order
      if (user.points >= 100) {
        user.level += 1;
        user.points = user.points - 100;
        if (!user.badges.includes('Nouveau niveau')) user.badges.push('Nouveau niveau');
      }
      if (user.badges.indexOf('🛒 Acheteur') === -1) user.badges.push('🛒 Acheteur');
      await user.save();
    }

    // Send confirmation email using SMTP settings from .env
    if (user && user.email) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      const mailOptions = {
        from: `Books Garden <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Confirmation de commande - Books Garden',
        text: `Bonjour ${user.name},\n\nVotre commande a bien été enregistrée !\nMontant total : ${total.toFixed(2)} €\nMerci pour votre confiance.\n\nBooks Garden™`,
        html: `<p>Bonjour <b>${user.name}</b>,</p><p>Votre commande a bien été enregistrée !</p><p><b>Montant total :</b> ${total.toFixed(2)} €</p><p>Merci pour votre confiance.<br/>Books Garden™</p>`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erreur lors de l\'envoi de l\'email :', error, user.email);
        } else {
          console.log('Email envoyé :', info.response, user.email);
        }
      });
    }

    res.json({ message: 'Commande validée', orderId: order.id });
  } catch (err) {
    console.error('Erreur lors de la validation de la commande :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Historique des commandes
router.get('/history', async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    const orders = await Order.find({ user: userId }).populate('books.book');
    res.json(orders);
  } catch (err) {
    console.error('Erreur lors de la récupération de l’historique :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;