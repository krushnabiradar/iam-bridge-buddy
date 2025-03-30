
const Position = require('../models/position.model');

// Get all positions
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find().populate('department', 'name');
    res.status(200).json({
      message: 'Positions retrieved successfully',
      positions
    });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ message: 'Failed to retrieve positions', error: error.message });
  }
};

// Get position by ID
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id).populate('department', 'name');
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    res.status(200).json({
      message: 'Position retrieved successfully',
      position
    });
  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ message: 'Failed to retrieve position', error: error.message });
  }
};

// Create new position
exports.createPosition = async (req, res) => {
  try {
    const { 
      title, 
      department, 
      description, 
      responsibilities, 
      requirements, 
      salaryRange,
      isActive 
    } = req.body;
    
    const position = new Position({
      title,
      department,
      description,
      responsibilities,
      requirements,
      salaryRange,
      isActive
    });
    
    await position.save();
    
    res.status(201).json({
      message: 'Position created successfully',
      position
    });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({ message: 'Failed to create position', error: error.message });
  }
};

// Update position
exports.updatePosition = async (req, res) => {
  try {
    const { 
      title, 
      department, 
      description, 
      responsibilities, 
      requirements, 
      salaryRange,
      isActive 
    } = req.body;
    
    // Check if position exists
    const position = await Position.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Update fields if provided
    if (title !== undefined) position.title = title;
    if (department !== undefined) position.department = department;
    if (description !== undefined) position.description = description;
    if (responsibilities !== undefined) position.responsibilities = responsibilities;
    if (requirements !== undefined) position.requirements = requirements;
    if (salaryRange !== undefined) position.salaryRange = salaryRange;
    if (isActive !== undefined) position.isActive = isActive;
    
    await position.save();
    
    res.status(200).json({
      message: 'Position updated successfully',
      position
    });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ message: 'Failed to update position', error: error.message });
  }
};

// Delete position
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    
    if (!position) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    await Position.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      message: 'Position deleted successfully'
    });
  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({ message: 'Failed to delete position', error: error.message });
  }
};
