const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const { DesignerProfile } = require('../models/DesignerProfile');
const auth = require('../middleware/auth');

// ── GET all user's conversations ──────────────────────────────────────────────
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.userId': req.user._id
    })
      .sort({ updatedAt: -1 })
      .populate('participants.userId', 'name email')
      .populate('designer', 'businessName')
      .limit(50);

    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET single conversation with messages ─────────────────────────────────────
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants.userId', 'name email')
      .populate('designer', 'businessName');

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Mark messages as read and reset unread count
    conversation.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) msg.read = true;
    });
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /chat/quotes/:quoteId — checkout fetches this to pre-fill
router.get('/quotes/:quoteId', auth, async (req, res) => {
  try {
    const Quote = require('../models/Quote');
    const quote = await Quote.findById(req.params.quoteId);

    if (!quote) return res.status(404).json({ success: false, error: 'Quote not found' });

    // Only the customer can fetch their own quote
    if (quote.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (['expired', 'cancelled'].includes(quote.status)) {
      return res.status(400).json({ success: false, error: `This quote is ${quote.status}` });
    }

    res.json({
      success: true,
      data: {
        _id:          quote._id,
        amount:       quote.amount,
        notes:        quote.notes,
        designerName: quote.designerName,
        designerId:   quote.designer,
        conversation: quote.conversation,
        status:       quote.status
      }
    });
  } catch (err) {
    console.error('Get quote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST start/find conversation with designer ────────────────────────────────
router.post('/conversations/start', auth, async (req, res) => {
  try {
    const { designerId, initialMessage } = req.body;

    const designer = await DesignerProfile.findById(designerId).populate('user');
    if (!designer) {
      return res.status(404).json({ success: false, error: 'Designer not found' });
    }

    const designerUserId = designer.user._id;

    
    let conversation = await Conversation.findOne({
      designer: designerId,
      $and: [
        { participants: { $elemMatch: { userId: req.user._id } } },
        { participants: { $elemMatch: { userId: designerUserId } } }
      ]
    });

    
    if (conversation) {
      return res.json({
        success: true,
        data: conversation,
        message: 'Conversation already exists'
      });
    }

    
    conversation = new Conversation({
      participants: [
        { userId: req.user._id,   role: 'customer', name: req.user.name },
        { userId: designerUserId, role: 'designer',  name: designer.businessName }
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
        [designerUserId.toString(), initialMessage ? 1 : 0]
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE conversation ───────────────────────────────────────────────────────
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Only a participant can delete
    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await Conversation.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    console.error('Delete conversation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST send message (HTTP fallback if socket fails) ─────────────────────────
router.post('/conversations/:id/message', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
      timestamp: new Date(),
      read: false
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = {
      text: text.trim(),
      timestamp: new Date(),
      sender: req.user._id,
      senderName: req.user.name
    };

    conversation.participants.forEach(p => {
      if (p.userId.toString() !== req.user._id.toString()) {
        const count = conversation.unreadCount.get(p.userId.toString()) || 0;
        conversation.unreadCount.set(p.userId.toString(), count + 1);
      }
    });

    await conversation.save();
    res.json({ success: true, data: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
