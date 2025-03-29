
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth' }),
  authController.socialAuthCallback
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth' }),
  authController.socialAuthCallback
);

// Social login (for frontend direct API calls - may be used for other providers)
router.post('/social', authController.socialLogin);

// SSO login
router.post('/sso', authController.ssoLogin);

// Verify token
router.get('/verify-token', authenticate, authController.verifyToken);

module.exports = router;
