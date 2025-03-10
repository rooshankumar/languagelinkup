
const express = require('express');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/progress/streak
// @desc    Get user's streak data
// @access  Private
router.get('/streak', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get progress data for all languages
    const progressData = await Progress.find({ user: userId });
    
    // Calculate overall streak
    const streak = user.streak;
    
    // Check if streak needs to be reset (no activity for more than 24 hours)
    const lastUpdated = new Date(streak.lastUpdated);
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdated.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 1) {
      // Reset streak if more than a day has passed
      user.streak.count = 0;
      user.streak.lastUpdated = now;
      await user.save();
    }
    
    // Prepare response with streak and progress summaries
    const response = {
      streak: user.streak,
      languages: progressData.map(prog => ({
        language: prog.language,
        level: prog.currentLevel,
        vocabCount: prog.vocabLearned.length,
        conversationsHeld: prog.conversationsHeld,
        practiceMinutes: prog.practiceMinutes,
        streakData: prog.streakData,
        weeklyGoal: prog.weeklyGoal,
        monthlyGoal: prog.monthlyGoal
      })),
      points: user.points
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get streak error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/progress/streak/update
// @desc    Update user's streak after activity
// @access  Private
router.post('/streak/update', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { language, activityType, minutes = 0 } = req.body;
    
    if (!language || !activityType) {
      return res.status(400).json({ 
        message: 'Language and activity type are required' 
      });
    }
    
    // Get user and progress data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find progress for this language
    let progress = await Progress.findOne({ user: userId, language });
    
    if (!progress) {
      // Create new progress record if it doesn't exist
      progress = await Progress.create({
        user: userId,
        language,
        currentLevel: user.learningLanguages.find(l => l.language === language)?.level || 'beginner'
      });
    }
    
    // Update progress based on activity type
    const now = new Date();
    
    if (activityType === 'practice') {
      progress.practiceMinutes += minutes;
      progress.weeklyGoal.completion += minutes;
    } else if (activityType === 'conversation') {
      progress.conversationsHeld += 1;
      progress.monthlyGoal.completion += 1;
    } else if (activityType === 'vocabulary') {
      // Vocabulary updates would be handled by another endpoint
    }
    
    // Update streak
    const lastPractice = new Date(progress.streakData.lastPracticeDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastPracticeDay = new Date(
      lastPractice.getFullYear(),
      lastPractice.getMonth(),
      lastPractice.getDate()
    );
    
    if (lastPracticeDay.getTime() < yesterday.getTime()) {
      // It's been more than a day since last practice
      if (lastPracticeDay.getTime() === yesterday.getTime()) {
        // Last practice was yesterday, increment streak
        progress.streakData.currentStreak += 1;
      } else {
        // Streak broken, reset to 1
        progress.streakData.currentStreak = 1;
      }
    } else if (lastPracticeDay.getTime() < today.getTime()) {
      // Last practice was earlier today
      progress.streakData.currentStreak += 1;
    }
    // If practice was already done today, don't change streak
    
    // Update longest streak if needed
    if (progress.streakData.currentStreak > progress.streakData.longestStreak) {
      progress.streakData.longestStreak = progress.streakData.currentStreak;
    }
    
    progress.streakData.lastPracticeDate = now;
    await progress.save();
    
    // Update user's overall streak
    const lastUpdated = new Date(user.streak.lastUpdated);
    const lastUpdatedDay = new Date(
      lastUpdated.getFullYear(),
      lastUpdated.getMonth(),
      lastUpdated.getDate()
    );
    
    if (lastUpdatedDay.getTime() < today.getTime()) {
      // New day, increment streak
      user.streak.count += 1;
      user.streak.lastUpdated = now;
      
      // Add points for maintaining streak
      user.points += 10 * user.streak.count; // More points for longer streaks
    }
    
    await user.save();
    
    res.json({
      message: 'Streak updated successfully',
      streak: user.streak,
      progress: {
        language: progress.language,
        streakData: progress.streakData,
        weeklyGoal: progress.weeklyGoal,
        monthlyGoal: progress.monthlyGoal
      },
      points: user.points
    });
  } catch (error) {
    console.error('Update streak error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/progress/:language
// @desc    Get detailed progress for a specific language
// @access  Private
router.get('/:language', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { language } = req.params;
    
    // Get progress data for the language
    const progress = await Progress.findOne({ user: userId, language });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress data not found for this language' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Get language progress error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
