const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  designer:     { type: mongoose.Schema.Types.ObjectId, ref: 'DesignerProfile', required: true },
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  amount:       { type: Number, required: true, min: 1 },
  notes:        { type: String, maxlength: 500, default: '' },
  designerName: { type: String },
  customerName: { type: String },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'cancelled'],
    default: 'pending'
  },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;