const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', 'name email avatar')
      .populate('department', 'name')
      .populate('position', 'title')
      .populate('manager', 'employeeId');
      
    res.status(200).json({
      message: 'Employees retrieved successfully',
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Failed to retrieve employees', error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('department', 'name')
      .populate('position', 'title')
      .populate('manager', 'employeeId');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.status(200).json({
      message: 'Employee retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Failed to retrieve employee', error: error.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const { 
      userId, 
      employeeId, 
      department, 
      position, 
      manager, 
      dateOfBirth, 
      dateOfJoining, 
      contactInformation,
      emergencyContact,
      status,
      bankDetails
    } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if employee with this user already exists
    const existingEmployee = await Employee.findOne({ userId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists for this user' });
    }
    
    // Check if employee ID is already in use
    const employeeWithSameId = await Employee.findOne({ employeeId });
    if (employeeWithSameId) {
      return res.status(400).json({ message: 'Employee ID is already in use' });
    }
    
    const employee = new Employee({
      userId,
      employeeId,
      department,
      position,
      manager,
      dateOfBirth,
      dateOfJoining,
      contactInformation,
      emergencyContact,
      status,
      bankDetails
    });
    
    await employee.save();
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { 
      department, 
      position, 
      manager, 
      dateOfBirth, 
      dateOfJoining, 
      contactInformation,
      emergencyContact,
      status,
      bankDetails
    } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Update fields if provided
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (manager !== undefined) employee.manager = manager;
    if (dateOfBirth !== undefined) employee.dateOfBirth = dateOfBirth;
    if (dateOfJoining !== undefined) employee.dateOfJoining = dateOfJoining;
    if (contactInformation !== undefined) employee.contactInformation = contactInformation;
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact;
    if (status !== undefined) employee.status = status;
    if (bankDetails !== undefined) employee.bankDetails = bankDetails;
    
    await employee.save();
    
    res.status(200).json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
};

// Update employee by manager
exports.updateEmployeeByManager = async (req, res) => {
  try {
    const { 
      contactInformation,
      emergencyContact,
      status
    } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Managers can only update limited fields
    if (contactInformation !== undefined) employee.contactInformation = contactInformation;
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact;
    if (status !== undefined) employee.status = status;
    
    await employee.save();
    
    res.status(200).json({
      message: 'Employee updated successfully by manager',
      employee
    });
  } catch (error) {
    console.error('Update employee by manager error:', error);
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
};

// Upload employee document
exports.uploadDocument = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;
    
    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    employee.documents.push({
      title,
      fileUrl,
      uploadDate: new Date()
    });
    
    await employee.save();
    
    res.status(200).json({
      message: 'Document uploaded successfully',
      employee
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await Employee.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
};

// Get self employee profile
exports.getSelfEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .populate('userId', 'name email avatar')
      .populate('department', 'name')
      .populate('position', 'title')
      .populate('manager', 'employeeId');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    res.status(200).json({
      message: 'Employee profile retrieved successfully',
      employee
    });
  } catch (error) {
    console.error('Get self employee profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve employee profile', error: error.message });
  }
};

// Update self employee profile
exports.updateSelfEmployeeProfile = async (req, res) => {
  try {
    const { 
      contactInformation,
      emergencyContact
    } = req.body;
    
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    
    // Self-service can only update limited fields
    if (contactInformation !== undefined) employee.contactInformation = contactInformation;
    if (emergencyContact !== undefined) employee.emergencyContact = emergencyContact;
    
    await employee.save();
    
    res.status(200).json({
      message: 'Employee profile updated successfully',
      employee
    });
  } catch (error) {
    console.error('Update self employee profile error:', error);
    res.status(500).json({ message: 'Failed to update employee profile', error: error.message });
  }
};
