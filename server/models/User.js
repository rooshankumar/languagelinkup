
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: '/placeholder.svg'
  },
  nativeLanguage: {
    type: String,
    required: true
  },
  learningLanguages: [{
    language: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'fluent'],
      default: 'beginner'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  streak: {
    count: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  points: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    maxlength: 300
  },
  goals: [{
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    description: String,
    completed: Boolean,
    dueDate: Date
  }],
  achievements: [{
    name: String,
    description: String,
    earnedAt: Date
  }],
  isOnboarded: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ nativeLanguage: 1, 'learningLanguages.language': 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
