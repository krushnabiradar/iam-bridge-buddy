
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header or cookie
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID and populate roles
    const user = await User.findById(decoded.id).select('-password').populate('roles');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    // User should be authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // If no roles required, proceed
    if (roles.length === 0) {
      return next();
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles.map(role => role.name);
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    // User should be authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has the required permission
    const userPermissions = req.user.roles.reduce((permissions, role) => {
      return [...permissions, ...role.permissions];
    }, []);

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
