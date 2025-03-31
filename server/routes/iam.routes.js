
const express = require('express');
const router = express.Router();
const iamController = require('../controllers/iam.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Role routes
router.get('/roles', authenticate, iamController.getAllRoles);
router.post('/roles', authenticate, authorize(['admin']), iamController.createRole);
router.put('/roles/:id', authenticate, authorize(['admin']), iamController.updateRole);
router.delete('/roles/:id', authenticate, authorize(['admin']), iamController.deleteRole);

// Permission routes
router.get('/permissions', authenticate, iamController.getAllPermissions);
router.post('/permissions', authenticate, authorize(['admin']), iamController.createPermission);

// User-Role management routes
router.post('/users/roles/assign', authenticate, authorize(['admin']), iamController.assignRoleToUser);
router.post('/users/roles/remove', authenticate, authorize(['admin']), iamController.removeRoleFromUser);
router.get('/users', authenticate, authorize(['admin']), iamController.getUsersWithRoles);
router.get('/users/:id', authenticate, iamController.getUserWithRoles);
router.put('/users/:id/status', authenticate, authorize(['admin']), iamController.updateUserStatus);

module.exports = router;
