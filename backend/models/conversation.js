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

    //  message type — 'text' (default) or 'payment_request'
    type: {
      type: String,
      enum: ['text', 'payment_request'],
      default: 'text'
    },

    // For text messages
    text: {
      type: String,
      maxlength: 2000
    },

    //  For payment_request messages only
    paymentRequest: {
      amount:      { type: Number },
      description: { type: String, maxlength: 500 },
      quoteId:     { type: String },
      status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
      }
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
    text:       String,
    timestamp:  Date,
    sender:     mongoose.Schema.Types.ObjectId,
    senderName: String
  },

  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }

}, { timestamps: true });

conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ designer: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
