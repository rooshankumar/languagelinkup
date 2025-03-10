
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, nativeLanguage } = req.body;

    // Check if required fields are provided
    if (!username || !email || !password || !nativeLanguage) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = await User.create({
      username,
      email,
      password,
      nativeLanguage
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        nativeLanguage: user.nativeLanguage,
        isOnboarded: user.isOnboarded,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Return user data and token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      nativeLanguage: user.nativeLanguage,
      learningLanguages: user.learningLanguages,
      profilePicture: user.profilePicture,
      isOnboarded: user.isOnboarded,
      streak: user.streak,
      token: generateToken(user._id)
    });
      
    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/updateprofile
// @desc    Update user profile
// @access  Private
router.put('/updateprofile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.username = req.body.username || user.username;
      user.nativeLanguage = req.body.nativeLanguage || user.nativeLanguage;
      user.learningLanguages = req.body.learningLanguages || user.learningLanguages;
      user.bio = req.body.bio || user.bio;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.isOnboarded = req.body.isOnboarded !== undefined ? req.body.isOnboarded : user.isOnboarded;
      
      // If password is included, it will be hashed by pre-save middleware
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        nativeLanguage: updatedUser.nativeLanguage,
        learningLanguages: updatedUser.learningLanguages,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        isOnboarded: updatedUser.isOnboarded,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
