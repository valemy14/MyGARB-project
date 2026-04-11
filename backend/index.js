require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ============================================
// CREATE HTTP SERVER FOR SOCKET.IO
// ============================================
const server = http.createServer(app);

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Initialize chat socket handlers
const initializeChat = require('./sockets/chatSocket');
initializeChat(io);

// ============================================
// IMPORT ROUTES
// ============================================
const auth = require('./routes/authRoutes');    
const fabrics = require('./routes/fabrics');    
const orders = require('./routes/orders'); 
const designerRoutes = require('./routes/designerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mygarbDataBase")
    .then(() => console.log('✅ Connected to mygarbDataBase...'))
    .catch(err => console.log('❌ MongoDB connection failed:', err));

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  exposedHeaders: ['x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ============================================
// ROUTES
// ============================================
app.use('/api/mygarb/auth', auth);
app.use('/api/mygarb/fabrics', fabrics);
app.use('/api/mygarb/orders', orders);
app.use('/api/mygarb/designers', designerRoutes);
app.use('/api/mygarb/payment', paymentRoutes);
app.use('/api/mygarb/chat', chatRoutes);  // ✅ NEW CHAT ROUTES

// ============================================
// TEST ROUTE
// ============================================
app.get('/api', (req, res) => {
    res.json({ 
        message: 'MYGARB Backend API is running! 🚀',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        socketio: 'Ready for real-time chat'
    });
});

// ============================================
// START SERVER (Changed from app.listen to server.listen)
// ============================================
const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`✅ MYGARB Backend listening on port ${port}...`);
    console.log(`✅ Socket.io ready for real-time chat`);
});