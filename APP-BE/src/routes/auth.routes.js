const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
];

const passwordUpdateValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
];

const settingsValidation = [
    body('displayName').optional().trim().isLength({ min: 1 }).withMessage('Display name cannot be empty'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CNY']).withMessage('Invalid currency'),
    body('theme').optional().isIn(['light', 'dark', 'system']).withMessage('Invalid theme')
];

// Routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/google', authController.googleLogin); // Google OAuth login
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, validate(passwordUpdateValidation), authController.updatePassword);
router.get('/settings', auth, authController.getSettings);
router.put('/settings', auth, validate(settingsValidation), authController.updateSettings);

module.exports = router;