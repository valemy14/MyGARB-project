const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const { DesignerProfile } = require('../models/DesignerProfile');
const { User } = require('../models/User');
const auth = require('../middleware/auth');

// Get all user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id
    })
    .sort({ updatedAt: -1 })
    .populate('participants.userId', 'name email')
    .populate('designer', 'businessName')
    .limit(50);

    res.json({
      success: true,
      data: conversations
    });

  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get single conversation with messages
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.userId', 'name email')
      .populate('designer', 'businessName');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.userId._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Mark messages as read
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        msg.read = true;
      }
    });

    // Reset unread count for this user
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      data: conversation
    });

  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Start new conversation with designer
router.post('/conversations/start', auth, async (req, res) => {
  try {
    const { designerId, initialMessage } = req.body;

    // Validate designer exists
    const designer = await DesignerProfile.findById(designerId).populate('user');
    if (!designer) {
      return res.status(404).json({
        success: false,
        error: 'Designer not found'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      'participants.userId': { $all: [req.user._id, designer.user._id] },
      designer: designerId
    });

    if (conversation) {
      return res.json({
        success: true,
        data: conversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [
        {
          userId: req.user._id,
          role: 'customer',
          name: req.user.name
        },
        {
          userId: designer.user._id,
          role: 'designer',
          name: designer.businessName
        }
      ],
      designer: designerId,
      messages: initialMessage ? [{
        sender: req.user._id,
        senderName: req.user.name,
        text: initialMessage,
        timestamp: new Date(),
        read: false
      }] : [],
      lastMessage: initialMessage ? {
        text: initialMessage,
        timestamp: new Date(),
        sender: req.user._id,
        senderName: req.user.name
      } : null,
      unreadCount: new Map([
        [req.user._id.toString(), 0],
        [designer.user._id.toString(), initialMessage ? 1 : 0]
      ])
    });

    await conversation.save();

    res.json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });

  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Send message (fallback if socket fails)
router.post('/conversations/:id/message', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
      timestamp: new Date(),
      read: false
    };

    conversation.messages.push(newMessage);

    // Update last message
    conversation.lastMessage = {
      text: text.trim(),
      timestamp: new Date(),
      sender: req.user._id,
      senderName: req.user.name
    };

    // Increment unread count for other participants
    conversation.participants.forEach(p => {
      if (p.userId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unreadCount.get(p.userId.toString()) || 0;
        conversation.unreadCount.set(p.userId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    res.json({
      success: true,
      data: newMessage
    });

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;