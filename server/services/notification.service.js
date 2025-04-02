
const Notification = require('../models/notification.model');
const NotificationPreferences = require('../models/notificationPreferences.model');
const User = require('../models/user.model');
const emailService = require('./email.service');

/**
 * Create a notification and optionally send an email
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification 
 */
const createNotification = async (notificationData) => {
  try {
    const { recipient, title, message, type = 'info', link, category } = notificationData;
    
    // Get user's notification preferences
    let preferences = await NotificationPreferences.findOne({ user: recipient });
    
    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await NotificationPreferences.create({ user: recipient });
    }
    
    // Check if user wants this type of notification (in-app)
    const showInApp = preferences.inApp[category] !== false;
    
    let notification = null;
    
    // Create in-app notification if enabled
    if (showInApp) {
      notification = await Notification.create({
        recipient,
        title,
        message,
        type,
        link
      });
    }
    
    // Check if user wants email for this notification
    const sendEmail = preferences.email[category] !== false;
    
    // Send email notification if enabled
    if (sendEmail) {
      const user = await User.findById(recipient);
      
      if (user && user.email) {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${title}</h2>
            <p>${message}</p>
            ${link ? `<a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">View Details</a>` : ''}
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #777; font-size: 12px;">You received this email because you enabled notifications for ${category} in your account settings.</p>
          </div>
        `;
        
        await emailService.sendEmail({
          to: user.email,
          subject: title,
          text: message,
          html: emailHtml
        });
        
        // Update notification to mark email as sent
        if (notification) {
          notification.emailSent = true;
          await notification.save();
        }
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error);
    throw error;
  }
};

/**
 * Get all unread notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of notifications
 */
const getUnreadNotifications = async (userId) => {
  return await Notification.find({
    recipient: userId,
    read: false
  }).sort({ createdAt: -1 });
};

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {number} limit - Max number of notifications to return
 * @param {number} skip - Number of notifications to skip (for pagination)
 * @returns {Promise<Array>} - Array of notifications
 */
const getUserNotifications = async (userId, limit = 20, skip = 0) => {
  return await Notification.find({
    recipient: userId
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} - Updated notification
 */
const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { read: true },
    { new: true }
  );
};

/**
 * Mark all user's notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Operation result
 */
const markAllAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

/**
 * Get or create notification preferences for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User's notification preferences
 */
const getUserPreferences = async (userId) => {
  let preferences = await NotificationPreferences.findOne({ user: userId });
  
  if (!preferences) {
    preferences = await NotificationPreferences.create({ user: userId });
  }
  
  return preferences;
};

/**
 * Update user's notification preferences
 * @param {string} userId - User ID
 * @param {Object} preferencesData - New preferences data
 * @returns {Promise<Object>} - Updated preferences
 */
const updateUserPreferences = async (userId, preferencesData) => {
  const { email, inApp } = preferencesData;
  
  // First get or create preferences
  let preferences = await NotificationPreferences.findOne({ user: userId });
  
  if (!preferences) {
    preferences = new NotificationPreferences({ user: userId });
  }
  
  // Update email preferences
  if (email) {
    Object.assign(preferences.email, email);
  }
  
  // Update in-app preferences
  if (inApp) {
    Object.assign(preferences.inApp, inApp);
  }
  
  preferences.updatedAt = new Date();
  
  return await preferences.save();
};

module.exports = {
  createNotification,
  getUnreadNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUserPreferences,
  updateUserPreferences
};
