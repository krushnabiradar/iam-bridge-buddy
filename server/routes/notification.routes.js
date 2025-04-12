
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Get all notifications for the authenticated user
router.get('/', notificationController.getUserNotifications);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Get notification preferences
router.get('/preferences', notificationController.getPreferences);

// Update notification preferences
router.put('/preferences', notificationController.updatePreferences);

module.exports = router;
