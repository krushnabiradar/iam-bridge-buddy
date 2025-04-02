
const notificationService = require('../services/notification.service');

// Get all notifications for the authenticated user
const getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const notifications = await notificationService.getUserNotifications(
      req.user._id,
      parseInt(limit),
      parseInt(skip)
    );
    
    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications
    });
  } catch (error) {
    console.error('Failed to retrieve notifications:', error);
    res.status(500).json({
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

// Get unread notifications count for the authenticated user
const getUnreadCount = async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications(req.user._id);
    
    res.status(200).json({
      message: 'Unread count retrieved successfully',
      count: notifications.length
    });
  } catch (error) {
    console.error('Failed to retrieve unread count:', error);
    res.status(500).json({
      message: 'Failed to retrieve unread count',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);
    
    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    
    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Get notification preferences
const getPreferences = async (req, res) => {
  try {
    const preferences = await notificationService.getUserPreferences(req.user._id);
    
    res.status(200).json({
      message: 'Notification preferences retrieved successfully',
      preferences
    });
  } catch (error) {
    console.error('Failed to retrieve notification preferences:', error);
    res.status(500).json({
      message: 'Failed to retrieve notification preferences',
      error: error.message
    });
  }
};

// Update notification preferences
const updatePreferences = async (req, res) => {
  try {
    const { email, inApp } = req.body;
    
    if (!email && !inApp) {
      return res.status(400).json({
        message: 'No preference data provided'
      });
    }
    
    const preferences = await notificationService.updateUserPreferences(
      req.user._id,
      { email, inApp }
    );
    
    res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    res.status(500).json({
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences
};
