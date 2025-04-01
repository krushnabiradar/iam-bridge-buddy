
const mongoose = require('mongoose');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const User = require('../models/user.model');

/**
 * Initialize default roles and permissions
 */
const initRoles = async () => {
  try {
    console.log('Initializing default roles and permissions...');
    
    // Define default permissions
    const defaultPermissions = [
      { name: 'view_users', description: 'View user list', resource: 'users', action: 'read' },
      { name: 'create_user', description: 'Create new users', resource: 'users', action: 'create' },
      { name: 'update_user', description: 'Update user details', resource: 'users', action: 'update' },
      { name: 'delete_user', description: 'Delete users', resource: 'users', action: 'delete' },
      { name: 'view_roles', description: 'View role list', resource: 'roles', action: 'read' },
      { name: 'create_role', description: 'Create new roles', resource: 'roles', action: 'create' },
      { name: 'update_role', description: 'Update roles', resource: 'roles', action: 'update' },
      { name: 'delete_role', description: 'Delete roles', resource: 'roles', action: 'delete' },
      { name: 'view_dashboard', description: 'Access dashboard', resource: 'dashboard', action: 'read' },
      { name: 'manage_system', description: 'Manage system settings', resource: 'system', action: 'manage' },
    ];
    
    // Create permissions if they don't exist
    for (const perm of defaultPermissions) {
      const existingPerm = await Permission.findOne({ name: perm.name });
      if (!existingPerm) {
        await Permission.create(perm);
        console.log(`Created permission: ${perm.name}`);
      }
    }
    
    // Define default roles with permissions
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: defaultPermissions.map(p => p.name),
        isDefault: false
      },
      {
        name: 'manager',
        description: 'Manager with user management access',
        permissions: ['view_users', 'create_user', 'update_user', 'view_dashboard'],
        isDefault: false
      },
      {
        name: 'editor',
        description: 'Editor with content management access',
        permissions: ['view_dashboard'],
        isDefault: false
      },
      {
        name: 'user',
        description: 'Regular user with limited access',
        permissions: ['view_dashboard'],
        isDefault: true
      }
    ];
    
    // Create roles if they don't exist
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`Created role: ${role.name}`);
      } else {
        // Update existing role permissions
        existingRole.permissions = role.permissions;
        existingRole.description = role.description;
        existingRole.isDefault = role.isDefault;
        await existingRole.save();
        console.log(`Updated role: ${role.name}`);
      }
    }
    
    // Ensure the first user has admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    const userRole = await Role.findOne({ name: 'user' });
    
    if (adminRole) {
      // Get the first user and make them an admin if no admins exist
      const adminUsers = await User.find({ roles: adminRole._id });
      
      if (adminUsers.length === 0) {
        const firstUser = await User.findOne({}).sort({ createdAt: 1 });
        if (firstUser) {
          // Check if they already have a role
          if (!firstUser.roles || firstUser.roles.length === 0) {
            firstUser.roles = [adminRole._id];
          } else if (!firstUser.roles.includes(adminRole._id)) {
            firstUser.roles.push(adminRole._id);
          }
          await firstUser.save();
          console.log(`Assigned admin role to user: ${firstUser.email}`);
        }
      }
    }
    
    // Assign default role to users without roles
    if (userRole) {
      const usersWithoutRoles = await User.find({ roles: { $size: 0 } });
      for (const user of usersWithoutRoles) {
        user.roles = [userRole._id];
        await user.save();
        console.log(`Assigned default role to user: ${user.email}`);
      }
      
      // Also update users with null/undefined roles array
      const usersWithNullRoles = await User.find({ roles: null });
      for (const user of usersWithNullRoles) {
        user.roles = [userRole._id];
        await user.save();
        console.log(`Assigned default role to user: ${user.email}`);
      }
    }
    
    console.log('Roles and permissions initialization complete');
  } catch (error) {
    console.error('Error initializing roles and permissions:', error);
  }
};

module.exports = initRoles;
