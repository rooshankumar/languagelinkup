
const express = require('express');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nativeLanguage,
      learningLanguages,
      bio,
      profilePicture
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (nativeLanguage) user.nativeLanguage = nativeLanguage;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;
    
    // Update learning languages
    if (learningLanguages && learningLanguages.length > 0) {
      // Filter out any existing languages and add new ones
      const existingLanguages = user.learningLanguages.map(l => l.language);
      
      learningLanguages.forEach(lang => {
        if (!existingLanguages.includes(lang.language)) {
          user.learningLanguages.push({
            language: lang.language,
            level: lang.level || 'beginner',
            startedAt: new Date()
          });
          
          // Create a progress record for this language
          Progress.create({
            user: user._id,
            language: lang.language,
            currentLevel: lang.level || 'beginner'
          });
        }
      });
    }
    
    // Set onboarded flag if not already set
    if (!user.isOnboarded) {
      user.isOnboarded = true;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
      nativeLanguage: updatedUser.nativeLanguage,
      learningLanguages: updatedUser.learningLanguages,
      bio: updatedUser.bio,
      isOnboarded: updatedUser.isOnboarded
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/matches
// @desc    Get language exchange matches
// @access  Private
router.get('/matches', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's native language and languages they're learning
    const nativeLanguage = user.nativeLanguage;
    const learningLanguages = user.learningLanguages.map(l => l.language);
    
    // Find users who are native speakers of languages the user is learning
    // AND who are learning the user's native language
    const matches = await User.find({
      _id: { $ne: user._id }, // Exclude current user
      nativeLanguage: { $in: learningLanguages }, // User is native in languages current user is learning
      'learningLanguages.language': nativeLanguage // User is learning current user's native language
    }).select('_id username firstName lastName profilePicture nativeLanguage learningLanguages bio lastActive');
    
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
