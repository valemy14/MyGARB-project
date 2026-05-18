import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    const token = localStorage.getItem('mygarb_token');
    if (!token) { console.error('No token. Cannot connect to socket.'); return; }

   this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => console.log('✅ Connected to chat server:', this.socket.id));
    this.socket.on('disconnect', (r) => console.log('❌ Disconnected:', r));
    this.socket.on('connect_error', (e) => console.error('Socket connection error:', e.message));
    this.socket.on('error', (e) => console.error('Socket error:', e));

    return this.socket;
  }

  disconnect() {
    if (this.socket) { this.socket.disconnect(); this.socket = null; }
  }

  isConnected() { return this.socket && this.socket.connected; }
  getSocket()   { return this.socket; }

  joinConversation(conversationId) {
    if (this.socket) this.socket.emit('joinConversation', conversationId);
    else console.warn('joinConversation: socket not connected');
  }

  sendMessage(conversationId, text) {
    if (this.socket) this.socket.emit('sendMessage', { conversationId, text });
    else console.warn('sendMessage: socket not connected');
  }

  // Designer sends a payment request message
  sendPaymentRequest(conversationId, amount, description) {
    if (this.socket) {
      this.socket.emit('sendPaymentRequest', { conversationId, amount, description });
    } else {
      console.warn('sendPaymentRequest: socket not connected');
    }
  }

  startTyping(conversationId)  { if (this.socket) this.socket.emit('typing',     { conversationId }); }
  stopTyping(conversationId)   { if (this.socket) this.socket.emit('stopTyping',  { conversationId }); }
  markAsRead(conversationId)   { if (this.socket) this.socket.emit('markAsRead',  { conversationId }); }

  onNewMessage(callback)         { if (this.socket) this.socket.on('newMessage',        callback); }
  onUserTyping(callback)         { if (this.socket) this.socket.on('userTyping',         callback); }
  onUserStoppedTyping(callback)  { if (this.socket) this.socket.on('userStoppedTyping',  callback); }
  removeAllListeners()           { if (this.socket) this.socket.removeAllListeners(); }
}

export default new SocketService();
