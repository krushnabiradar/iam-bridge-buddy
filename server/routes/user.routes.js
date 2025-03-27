
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get user profile (requires authentication)
router.get('/profile', authenticate, userController.getProfile);

// Update user profile (requires authentication)
router.put('/profile', authenticate, userController.updateProfile);

// Get all users (admin only)
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

module.exports = router;
