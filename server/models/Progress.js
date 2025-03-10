
const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  vocabLearned: [{
    word: String,
    translation: String,
    context: String,
    mastered: {
      type: Boolean,
      default: false
    },
    lastPracticed: {
      type: Date,
      default: Date.now
    }
  }],
  grammarConcepts: [{
    concept: String,
    examples: [String],
    mastered: {
      type: Boolean,
      default: false
    },
    lastPracticed: {
      type: Date,
      default: Date.now
    }
  }],
  practiceMinutes: {
    type: Number,
    default: 0
  },
  conversationsHeld: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'fluent'],
    default: 'beginner'
  },
  streakData: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastPracticeDate: {
      type: Date,
      default: Date.now
    }
  },
  weeklyGoal: {
    minutes: {
      type: Number,
      default: 60
    },
    completion: {
      type: Number,
      default: 0
    }
  },
  monthlyGoal: {
    conversations: {
      type: Number,
      default: 8
    },
    completion: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
ProgressSchema.index({ user: 1, language: 1 });
ProgressSchema.index({ 'streakData.currentStreak': -1 });
ProgressSchema.index({ 'streakData.lastPracticeDate': -1 });

module.exports = mongoose.model('Progress', ProgressSchema);
