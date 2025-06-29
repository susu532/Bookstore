const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.body.userId + '_' + Date.now() + ext);
  }
});
const upload = multer({ storage });

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
    if (!user.isActive) {
      return res.status(403).json({ message: 'Vous êtes banni.' });
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
router.put('/profile', upload.single('avatar'), async (req, res) => {
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
    if (req.file) {
      user.avatar = '/uploads/avatars/' + req.file.filename;
    }
    await user.save();

    // Emit avatar update event via socket.io
    const io = req.app.get('io');
    if (io && user.avatar) {
      // Emit to all: for admin user table, and to the user for their own navbar/profile
      io.emit('avatarUpdated', { userId: user._id.toString(), avatar: user.avatar });
    }

    // Emit gamification update event via socket.io (real-time, not fake)
    if (io) {
      io.to(user._id.toString()).emit('gamificationUpdate', {
        points: user.points,
        level: user.level,
        badges: user.badges
      });
    }

    res.json({ message: 'Profil mis à jour avec succès', avatar: user.avatar, gamification: { points: user.points, level: user.level, badges: user.badges } });
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