const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['order', 'payment', 'chat', 'general'], default: 'general' },
  link:    { type: String, default: '' },
  read:    { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);