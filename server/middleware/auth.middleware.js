
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to authenticate user based on JWT token
 * Supports token from cookies or Authorization header
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from authorization header or cookie
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format', code: 'INVALID_TOKEN' });
      }
      throw jwtError;
    }
    
    // Find user by ID and populate roles
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate({
        path: 'roles',
        select: 'name permissions description isDefault' // Include all necessary role fields
      });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated', code: 'ACCOUNT_INACTIVE' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error', code: 'AUTH_ERROR' });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param {string|string[]} roles - Required role(s)
 */
exports.authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    // User should be authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
    }

    // If no roles required, proceed
    if (roles.length === 0) {
      return next();
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles.map(role => role.name);
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions', 
        code: 'INSUFFICIENT_ROLES',
        requiredRoles: roles,
        userRoles
      });
    }

    next();
  };
};

/**
 * Middleware to authorize user based on specific permission
 * @param {string} permission - Required permission
 */
exports.hasPermission = (permission) => {
  return async (req, res, next) => {
    // User should be authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
    }

    // Check if user has the required permission
    const userPermissions = req.user.roles.reduce((permissions, role) => {
      return [...permissions, ...(role.permissions || [])];
    }, []);

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions', 
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission
      });
    }

    next();
  };
};
