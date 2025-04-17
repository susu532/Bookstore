const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// Inscription
router.post('/register', [
  check('name', 'Le nom est requis').not().isEmpty(),
  check('email', 'Email invalide').isEmail(),
  check('password', 'Le mot de passe doit avoir 8 caractères minimum').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ userId: user.id, redirectUrl: '/dashboard' });
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Connexion
router.post('/login', [
  check('email', 'Email invalide').isEmail(),
  check('password', 'Mot de passe requis').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Erreurs de validation :', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  console.log('Tentative de connexion avec :', { email, password });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Utilisateur non trouvé pour email :', email);
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Mot de passe incorrect pour :', email);
      return res.status(400).json({ message: 'Identifiants incorrects' });
    }
    const redirectUrl = user.role === 1 ? '/admin/users' : '/dashboard';
    console.log('Connexion réussie pour :', email);
    res.json({ userId: user.id, redirectUrl });
  } catch (err) {
    console.error('Erreur serveur lors de la connexion :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mise à jour du profil
router.put('/profile', async (req, res) => {
  const { userId, name, email, password } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Déconnexion
router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;