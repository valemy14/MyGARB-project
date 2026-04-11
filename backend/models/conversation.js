const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'designer'],
      required: true
    },
    name: String
  }],
  
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignerProfile',
    required: true
  },
  
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderName: String,
    text: {
      type: String,
      required: true,
      maxlength: 2000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  lastMessage: {
    text: String,
    timestamp: Date,
    sender: mongoose.Schema.Types.ObjectId,
    senderName: String
  },
  
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
  
}, { timestamps: true });

// Indexes for faster queries
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ designer: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;