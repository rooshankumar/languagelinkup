
const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get all chats for a user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all chats where the user is a participant
    const chats = await Chat.find({ 
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username firstName lastName profilePicture')
    .select('participants lastMessage updatedAt languagePair')
    .sort({ updatedAt: -1 });
    
    // Format the response
    const formattedChats = chats.map(chat => {
      // Find the other participant (not the current user)
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      
      return {
        _id: chat._id,
        partner: otherParticipant,
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        languagePair: chat.languagePair
      };
    });
    
    res.json(formattedChats);
  } catch (error) {
    console.error('Get chats error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/chat/messages/:chatId
// @desc    Get messages for a specific chat
// @access  Private
router.get('/messages/:chatId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    
    // Find the chat and make sure user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate({
      path: 'messages.sender',
      select: 'username firstName lastName profilePicture'
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Mark messages as read
    chat.messages.forEach(message => {
      if (message.sender._id.toString() !== userId.toString()) {
        // Only mark messages from the other person as read
        const alreadyRead = message.readBy.some(
          read => read.user.toString() === userId.toString()
        );
        
        if (!alreadyRead) {
          message.readBy.push({
            user: userId,
            readAt: new Date()
          });
        }
      }
    });
    
    await chat.save();
    
    res.json(chat.messages);
  } catch (error) {
    console.error('Get messages error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/chat/messages/:chatId
// @desc    Send a message in a chat
// @access  Private
router.post('/messages/:chatId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { content, originalLanguage } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Find the chat and make sure user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Create new message
    const newMessage = {
      sender: userId,
      content,
      originalLanguage,
      readBy: [{ user: userId, readAt: new Date() }]
    };
    
    // Add message to chat
    chat.messages.push(newMessage);
    
    // Update last message
    chat.lastMessage = {
      content,
      sender: userId,
      createdAt: new Date()
    };
    
    await chat.save();
    
    // Get the populated message to return
    const populatedChat = await Chat.findById(chatId)
      .populate({
        path: 'messages.sender',
        select: 'username firstName lastName profilePicture'
      });
    
    const sentMessage = populatedChat.messages[populatedChat.messages.length - 1];
    
    // Update user's conversation count in Progress collection
    const user = await User.findById(userId);
    if (user.learningLanguages.some(l => l.language === originalLanguage)) {
      // Update progress for this language
      const progress = await Progress.findOne({ 
        user: userId,
        language: originalLanguage
      });
      
      if (progress) {
        progress.conversationsHeld += 1;
        progress.streakData.lastPracticeDate = new Date();
        await progress.save();
      }
    }
    
    res.status(201).json(sentMessage);
  } catch (error) {
    console.error('Send message error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/chat/start
// @desc    Start a new chat with another user
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { partnerId, language1, language2 } = req.body;
    
    if (!partnerId || !language1 || !language2) {
      return res.status(400).json({ 
        message: 'Partner ID and both languages are required' 
      });
    }
    
    // Check if partner exists
    const partner = await User.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [userId, partnerId] },
      isActive: true
    });
    
    if (existingChat) {
      return res.status(200).json({ 
        message: 'Chat already exists',
        chatId: existingChat._id
      });
    }
    
    // Create new chat
    const newChat = await Chat.create({
      participants: [userId, partnerId],
      languagePair: { language1, language2 },
      messages: []
    });
    
    // Return the chat with populated participants
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'username firstName lastName profilePicture');
    
    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Start chat error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
