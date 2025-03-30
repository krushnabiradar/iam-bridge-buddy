
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const employeeController = require('../controllers/employee.controller');
const positionController = require('../controllers/position.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Department routes
router.get('/departments', departmentController.getAllDepartments);
router.get('/departments/:id', departmentController.getDepartmentById);
router.post('/departments', authorize(['admin', 'hr']), departmentController.createDepartment);
router.put('/departments/:id', authorize(['admin', 'hr']), departmentController.updateDepartment);
router.delete('/departments/:id', authorize(['admin']), departmentController.deleteDepartment);

// Position routes
router.get('/positions', positionController.getAllPositions);
router.get('/positions/:id', positionController.getPositionById);
router.post('/positions', authorize(['admin', 'hr']), positionController.createPosition);
router.put('/positions/:id', authorize(['admin', 'hr']), positionController.updatePosition);
router.delete('/positions/:id', authorize(['admin']), positionController.deletePosition);

// Employee routes
router.get('/employees', authorize(['admin', 'hr', 'manager']), employeeController.getAllEmployees);
router.get('/employees/:id', employeeController.getEmployeeById);
router.post('/employees', authorize(['admin', 'hr']), employeeController.createEmployee);
router.put('/employees/:id', authorize(['admin', 'hr']), employeeController.updateEmployee);
router.post('/employees/:id/documents', authorize(['admin', 'hr']), employeeController.uploadDocument);
router.delete('/employees/:id', authorize(['admin']), employeeController.deleteEmployee);

module.exports = router;
