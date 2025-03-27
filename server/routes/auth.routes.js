
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Social login
router.post('/social', authController.socialLogin);

// SSO login
router.post('/sso', authController.ssoLogin);

module.exports = router;
