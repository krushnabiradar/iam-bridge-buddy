
const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  isManagerRole: {
    type: Boolean,
    default: false
  },
  responsibilities: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  salaryRange: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// When a position is marked as a manager role, assign the 'manager' role to users with this position
positionSchema.pre('save', async function(next) {
  if (this.isModified('isManagerRole') && this.isManagerRole) {
    // This would update users, but we would need to include the Employee model
    // Not implementing here to avoid circular dependencies
    console.log('Position marked as manager role:', this.title);
  }
  next();
});

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;
