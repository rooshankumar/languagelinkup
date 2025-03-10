import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, bio, nativeLanguage, learningLanguages } = req.body;

    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (nativeLanguage) updateFields.nativeLanguage = nativeLanguage;
    if (learningLanguages) updateFields.learningLanguages = learningLanguages;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user stats
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("streak points lastActive");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      streak: user.streak,
      points: user.points,
      lastActive: user.lastActive
    });
  } catch (error) {
    console.error("Stats retrieval error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)  -- Retained from original code
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => { //Using auth instead of protect
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;