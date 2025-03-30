
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  dateOfBirth: {
    type: Date
  },
  dateOfJoining: {
    type: Date,
    required: true
  },
  contactInformation: {
    phone: {
      type: String,
      trim: true
    },
    alternateEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['active', 'onLeave', 'terminated', 'retired'],
    default: 'active'
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  documents: [{
    title: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  attendance: [{
    date: {
      type: Date,
      required: true
    },
    clockIn: Date,
    clockOut: Date,
    location: {
      latitude: Number,
      longitude: Number
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'halfDay', 'workFromHome'],
      default: 'present'
    },
    notes: String,
    edited: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }],
  leaves: [{
    type: {
      type: String,
      enum: ['sick', 'casual', 'annual', 'unpaid', 'other'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    },
    approvalChain: [{
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      date: Date,
      comments: String
    }]
  }],
  leaveBalance: {
    sick: {
      type: Number,
      default: 10
    },
    casual: {
      type: Number,
      default: 10
    },
    annual: {
      type: Number,
      default: 15
    }
  },
  performance: [{
    year: Number,
    quarter: Number,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    ratings: {
      technical: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      teamwork: {
        type: Number,
        min: 1,
        max: 5
      },
      leadership: {
        type: Number,
        min: 1,
        max: 5
      },
      overall: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    feedback: String,
    goals: [{
      description: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['pending', 'inProgress', 'completed', 'deferred'],
        default: 'pending'
      }
    }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'acknowledged', 'final'],
      default: 'draft'
    }
  }],
  salary: {
    basic: Number,
    hra: Number,
    allowances: Number,
    deductions: Number,
    tax: Number,
    netSalary: Number,
    bankAccount: String,
    paymentHistory: [{
      month: Number,
      year: Number,
      amount: Number,
      paymentDate: Date,
      status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
      },
      slipUrl: String
    }]
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

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
