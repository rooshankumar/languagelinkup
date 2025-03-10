
import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields if provided
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.nativeLanguage) user.nativeLanguage = req.body.nativeLanguage;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.learningLanguages) user.learningLanguages = req.body.learningLanguages;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    
    // For password, we need to handle differently due to hashing
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update onboarding status if provided
    if (req.body.isOnboarded !== undefined) {
      user.isOnboarded = req.body.isOnboarded;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      nativeLanguage: updatedUser.nativeLanguage,
      learningLanguages: updatedUser.learningLanguages,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      isOnboarded: updatedUser.isOnboarded
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
