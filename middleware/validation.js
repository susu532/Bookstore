const { check, validationResult } = require('express-validator');

exports.validateUserSignup = [
    check('username').notEmpty().withMessage('Le nom est requis'),
    check('email').isEmail().withMessage('Email invalide'),
    check('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];

exports.validateBook = [
    check('title').notEmpty().withMessage('Le titre est requis'),
    check('price').isNumeric().withMessage('Le prix doit être un nombre'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        next();
    }
];
