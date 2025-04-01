
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required unless authenticated through social or SSO
      return !this.socialProvider;
    }
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String
  },
  socialProvider: {
    type: String,
    enum: ['Google', 'GitHub', null],
    default: null
  },
  socialId: {
    type: String
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to validate password
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to check if user has a specific permission
userSchema.methods.hasPermission = async function(permission) {
  // Populate roles if not already populated
  if (!this.populated('roles')) {
    await this.populate('roles');
  }
  
  // Check if any of the user's roles include the specified permission
  return this.roles.some(role => role.permissions.includes(permission));
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(roleName) {
  // Populate roles if not already populated
  if (!this.populated('roles')) {
    return false;
  }
  
  // Check if user has the specified role
  return this.roles.some(role => role.name === roleName);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
