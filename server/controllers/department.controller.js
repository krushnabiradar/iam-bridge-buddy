
const Department = require('../models/department.model');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('manager', 'employeeId');
    res.status(200).json({
      message: 'Departments retrieved successfully',
      departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Failed to retrieve departments', error: error.message });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'employeeId');
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.status(200).json({
      message: 'Department retrieved successfully',
      department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Failed to retrieve department', error: error.message });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, manager } = req.body;
    
    // Check if department already exists
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({ message: 'Department with this name already exists' });
    }
    
    const department = new Department({
      name,
      description,
      manager
    });
    
    await department.save();
    
    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Failed to create department', error: error.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, manager } = req.body;
    
    // Check if department exists
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if name is being changed and if the new name is already taken
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({ message: 'Department with this name already exists' });
      }
      department.name = name;
    }
    
    if (description !== undefined) department.description = description;
    if (manager !== undefined) department.manager = manager;
    
    await department.save();
    
    res.status(200).json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    await Department.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
};
