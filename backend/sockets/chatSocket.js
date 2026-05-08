const jwt = require('jsonwebtoken');
const Conversation = require('../models/conversation');
const Quote = require('../models/Quote');
const { DesignerProfile } = require('../models/DesignerProfile')

module.exports = function initializeChat(io) {

  // ── Auth middleware ───────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: No token provided'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // ── Join conversation room ────────────────────────────────
    socket.on('joinConversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return socket.emit('error', { message: 'Conversation not found' });

        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId.toString()
        );
        if (!isParticipant) return socket.emit('error', { message: 'Access denied' });

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (err) {
        console.error('joinConversation error:', err);
      }
    });

    // ── Send text message ─────────────────────────────────────
    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId.toString()
        );
        if (!isParticipant) return;

        const senderParticipant = conversation.participants.find(
          p => p.userId.toString() === socket.userId.toString()
        );

        const newMessage = {
          sender:     socket.userId,
          senderName: senderParticipant?.name || 'User',
          type:       'text',
          text:       text.trim(),
          timestamp:  new Date(),
          read:       false
        };

        conversation.messages.push(newMessage);
        conversation.lastMessage = {
          text:       text.trim(),
          timestamp:  new Date(),
          sender:     socket.userId,
          senderName: senderParticipant?.name || 'User'
        };

        conversation.participants.forEach(p => {
          if (p.userId.toString() !== socket.userId.toString()) {
            const current = conversation.unreadCount.get(p.userId.toString()) || 0;
            conversation.unreadCount.set(p.userId.toString(), current + 1);
          }
        });

        await conversation.save();
        const savedMessage = conversation.messages[conversation.messages.length - 1];

        console.log(`Message sent in conversation ${conversationId} by ${socket.userId}`);

        io.to(conversationId).emit('newMessage', { conversationId, message: savedMessage });
      } catch (err) {
        console.error('sendMessage error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── ✅ Send payment request (designer only) ───────────────
    // Frontend calls: socketService.sendPaymentRequest(conversationId, amount, description)
    socket.on('sendPaymentRequest', async ({ conversationId, amount, description }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return socket.emit('error', { message: 'Conversation not found' });

        // Only designers can send payment requests
        const senderParticipant = conversation.participants.find(
          p => p.userId.toString() === socket.userId.toString()
        );
        if (!senderParticipant) return socket.emit('error', { message: 'Access denied' });
        if (senderParticipant.role !== 'designer') {
          return socket.emit('error', { message: 'Only designers can send payment requests' });
        }

        // Validate amount
        if (!amount || amount <= 0) {
          return socket.emit('error', { message: 'Amount must be greater than 0' });
        }

        // Find customer participant
        const customerParticipant = conversation.participants.find(p => p.role === 'customer');

        // Save Quote to DB
        const designerProfile = await DesignerProfile.findOne({ user: socket.userId });
        const quote = new Quote({
        designer:     designerProfile?._id || socket.userId,
        customer:     customerParticipant?.userId,
        conversation: conversationId,
        amount:       Number(amount),
        notes:        description?.trim() || '',
        designerName: senderParticipant.name,
        customerName: customerParticipant?.name || 'Customer',
        status:       'pending'
        });
        await quote.save();
        console.log(`Quote saved: ${quote._id} for ₦${amount}`);

        const paymentRequestMessage = {
          sender:     socket.userId,
          senderName: senderParticipant.name,
          type:       'payment_request',
          text:       `Payment request: ₦${Number(amount).toLocaleString()}`,
          paymentRequest: {
            amount:      Number(amount),
            description: description?.trim() || 'Custom order payment',
            status:      'pending',
            quoteId:     quote._id.toString()
          },
          timestamp: new Date(),
          read:      false
        };

        conversation.messages.push(paymentRequestMessage);
        conversation.lastMessage = {
          text:       `💳 Payment request: ₦${Number(amount).toLocaleString()}`,
          timestamp:  new Date(),
          sender:     socket.userId,
          senderName: senderParticipant.name
        };

        // Increment unread for customer
        conversation.participants.forEach(p => {
          if (p.userId.toString() !== socket.userId.toString()) {
            const current = conversation.unreadCount.get(p.userId.toString()) || 0;
            conversation.unreadCount.set(p.userId.toString(), current + 1);
          }
        });

        await conversation.save();
        const savedMessage = conversation.messages[conversation.messages.length - 1];

        console.log(`Payment request sent in conversation ${conversationId}: ₦${amount}`);

        // Broadcast to entire room — both designer and customer see it
        io.to(conversationId).emit('newMessage', { conversationId, message: savedMessage });

      } catch (err) {
        console.error('sendPaymentRequest error:', err);
        socket.emit('error', { message: 'Failed to send payment request' });
      }
    });

    // ── Typing indicators ─────────────────────────────────────
    socket.on('typing', ({ conversationId }) => {
      Conversation.findById(conversationId)
        .then(conversation => {
          if (!conversation) return;
          const participant = conversation.participants.find(
            p => p.userId.toString() === socket.userId.toString()
          );
          socket.to(conversationId).emit('userTyping', {
            conversationId,
            userName: participant?.name || 'Someone'
          });
        })
        .catch(err => console.error('typing error:', err));
    });

    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(conversationId).emit('userStoppedTyping', { conversationId });
    });

    // ── Mark as read ──────────────────────────────────────────
    socket.on('markAsRead', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        let changed = false;
        conversation.messages.forEach(msg => {
          if (msg.sender.toString() !== socket.userId.toString() && !msg.read) {
            msg.read = true;
            changed = true;
          }
        });
        conversation.unreadCount.set(socket.userId.toString(), 0);
        if (changed) await conversation.save();
      } catch (err) {
        console.error('markAsRead error:', err);
      }
    });

    // ── Disconnect ────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
};
