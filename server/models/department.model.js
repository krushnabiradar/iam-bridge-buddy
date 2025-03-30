
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  budget: {
    type: Number,
    default: 0
  },
  headcount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for getting employees in this department
departmentSchema.virtual('employees', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'department'
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
