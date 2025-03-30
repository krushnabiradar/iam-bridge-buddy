
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
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
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

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// New middleware to check if user is an employee's manager
exports.isEmployeeManager = async (req, res, next) => {
  try {
    // Only proceed if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden: Not a manager' });
    }
    
    const employeeId = req.params.id;
    const Employee = require('../models/employee.model');
    
    // Find the employee and check if the manager's department matches
    const employee = await Employee.findById(employeeId).populate('department');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Find the manager's employee record
    const managerEmployee = await Employee.findOne({ userId: req.user._id });
    if (!managerEmployee) {
      return res.status(403).json({ message: 'Forbidden: Manager profile not found' });
    }
    
    // Check if manager is assigned to the employee's department
    if (!employee.department || 
        !managerEmployee.department || 
        employee.department._id.toString() !== managerEmployee.department.toString()) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to manage this employee' });
    }
    
    next();
  } catch (error) {
    console.error('Manager authorization error:', error);
    return res.status(500).json({ message: 'Error checking manager authorization' });
  }
};
