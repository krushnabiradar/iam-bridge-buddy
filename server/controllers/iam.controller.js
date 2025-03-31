
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({
      message: 'Roles retrieved successfully',
      roles
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({ message: 'Failed to retrieve roles', error: error.message });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, isDefault } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }
    
    // Create new role
    const role = new Role({
      name,
      description,
      permissions,
      isDefault
    });
    
    await role.save();
    
    res.status(201).json({
      message: 'Role created successfully',
      role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: 'Failed to create role', error: error.message });
  }
};

// Update a role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isDefault } = req.body;
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if name is being changed and if new name already exists
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return res.status(400).json({ message: 'Role with this name already exists' });
      }
      role.name = name;
    }
    
    // Update fields
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;
    if (isDefault !== undefined) role.isDefault = isDefault;
    
    await role.save();
    
    res.status(200).json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if any users have this role
    const usersWithRole = await User.findOne({ roles: id });
    if (usersWithRole) {
      return res.status(400).json({ message: 'Cannot delete role as it is assigned to users' });
    }
    
    await Role.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ message: 'Failed to delete role', error: error.message });
  }
};

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.status(200).json({
      message: 'Permissions retrieved successfully',
      permissions
    });
  } catch (error) {
    console.error('Get all permissions error:', error);
    res.status(500).json({ message: 'Failed to retrieve permissions', error: error.message });
  }
};

// Create permission
exports.createPermission = async (req, res) => {
  try {
    const { name, description, resource, action } = req.body;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name });
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission already exists' });
    }
    
    // Create new permission
    const permission = new Permission({
      name,
      description,
      resource,
      action
    });
    
    await permission.save();
    
    res.status(201).json({
      message: 'Permission created successfully',
      permission
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({ message: 'Failed to create permission', error: error.message });
  }
};

// Assign role to user
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if user already has this role
    if (user.roles.includes(roleId)) {
      return res.status(400).json({ message: 'User already has this role' });
    }
    
    // Add role to user
    user.roles.push(roleId);
    await user.save();
    
    // Return updated user with populated roles
    const updatedUser = await User.findById(userId).populate('roles');
    
    res.status(200).json({
      message: 'Role assigned to user successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ message: 'Failed to assign role', error: error.message });
  }
};

// Remove role from user
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has this role
    if (!user.roles.includes(roleId)) {
      return res.status(400).json({ message: 'User does not have this role' });
    }
    
    // Remove role from user
    user.roles = user.roles.filter(role => role.toString() !== roleId);
    await user.save();
    
    // Return updated user with populated roles
    const updatedUser = await User.findById(userId).populate('roles');
    
    res.status(200).json({
      message: 'Role removed from user successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Remove role error:', error);
    res.status(500).json({ message: 'Failed to remove role', error: error.message });
  }
};

// Get all users with roles
exports.getUsersWithRoles = async (req, res) => {
  try {
    const users = await User.find().populate('roles').select('-password');
    res.status(200).json({
      message: 'Users retrieved successfully',
      users
    });
  } catch (error) {
    console.error('Get users with roles error:', error);
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

// Get user details with roles
exports.getUserWithRoles = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).populate('roles').select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get user with roles error:', error);
    res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};
