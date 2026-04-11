const Conversation = require('../models/conversation');
const jwt = require('jsonwebtoken');

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded._id;
    socket.userName = decoded.name;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

// Initialize socket handlers
const initializeChat = (io) => {
  // Authenticate all socket connections
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // User joins their personal room
    socket.join(`user:${socket.userId}`);

    // Join a specific conversation
    socket.on('joinConversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);

      } catch (err) {
        console.error('Join conversation error:', err);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Send message
    socket.on('sendMessage', async ({ conversationId, text }) => {
      try {
        if (!text || !text.trim()) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
          p => p.userId.toString() === socket.userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create new message
        const newMessage = {
          sender: socket.userId,
          senderName: socket.userName,
          text: text.trim(),
          timestamp: new Date(),
          read: false
        };

        conversation.messages.push(newMessage);

        // Update last message
        conversation.lastMessage = {
          text: text.trim(),
          timestamp: new Date(),
          sender: socket.userId,
          senderName: socket.userName
        };

        // Increment unread count for other participants
        conversation.participants.forEach(p => {
          if (p.userId.toString() !== socket.userId) {
            const currentCount = conversation.unreadCount.get(p.userId.toString()) || 0;
            conversation.unreadCount.set(p.userId.toString(), currentCount + 1);
          }
        });

        await conversation.save();

        // Emit to all users in the conversation (including sender)
        io.to(`conversation:${conversationId}`).emit('newMessage', {
          conversationId,
          message: newMessage
        });

        // Also emit to other participants' personal rooms (for notifications)
        conversation.participants.forEach(p => {
          if (p.userId.toString() !== socket.userId) {
            io.to(`user:${p.userId}`).emit('conversationUpdated', {
              conversationId,
              lastMessage: conversation.lastMessage,
              unreadCount: conversation.unreadCount.get(p.userId.toString())
            });
          }
        });

        console.log(`Message sent in conversation ${conversationId} by ${socket.userId}`);

      } catch (err) {
        console.error('Send message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('userTyping', {
        conversationId,
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('userStoppedTyping', {
        conversationId,
        userId: socket.userId
      });
    });

    // Mark messages as read
    socket.on('markAsRead', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return;

        // Mark all messages from other users as read
        conversation.messages.forEach(msg => {
          if (msg.sender.toString() !== socket.userId) {
            msg.read = true;
          }
        });

        // Reset unread count for this user
        conversation.unreadCount.set(socket.userId, 0);
        await conversation.save();

        // Notify other participants
        socket.to(`conversation:${conversationId}`).emit('messagesRead', {
          conversationId,
          readBy: socket.userId
        });

      } catch (err) {
        console.error('Mark as read error:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initializeChat;