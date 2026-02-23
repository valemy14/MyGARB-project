require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const auth = require('./routes/authRoutes');    // ✅ One dot
const fabrics = require('./routes/fabrics');    // ✅ One dot (FIXED!)

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mygarbDataBase")
    .then(() => console.log('✅ Connected to mygarbDataBase...'))
    .catch(err => console.log('❌ MongoDB connection failed:', err));

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/mygarb/auth', auth);
app.use('/api/mygarb/fabrics', fabrics);

// Test route
app.get('/api', (req, res) => {
    res.json({ 
        message: 'MYGARB Backend API is running! 🚀',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`✅ MYGARB Backend listening on port ${port}...`));