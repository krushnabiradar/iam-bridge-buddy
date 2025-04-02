
const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    securityAlerts: {
      type: Boolean,
      default: true
    },
    accountUpdates: {
      type: Boolean,
      default: true
    },
    roleChanges: {
      type: Boolean,
      default: true
    }
  },
  inApp: {
    securityAlerts: {
      type: Boolean,
      default: true
    },
    accountUpdates: {
      type: Boolean,
      default: true
    },
    roleChanges: {
      type: Boolean,
      default: true
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

module.exports = NotificationPreferences;
