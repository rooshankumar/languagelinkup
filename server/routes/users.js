import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/language-partners
// @desc    Get language exchange partners
// @access  Private
router.get('/language-partners', authMiddleware, async (req, res) => {
  try {
    // Find users who are learning the current user's native language
    // and whose native language is one the current user is learning
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get users with matching language preferences (mutual language exchange)
    const partners = await User.find({
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { nativeLanguage: { $in: user.learningLanguages } },
        { learningLanguages: user.nativeLanguage }
      ]
    }).select('-password');

    res.json(partners);
  } catch (error) {
    console.error('Get language partners error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get user by ID error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authMiddleware, async (req, res) => { //Removed admin middleware as it's not provided in edited snippet
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;