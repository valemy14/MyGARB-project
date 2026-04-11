const { User, validate } = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');  // ← ADD THIS (was missing!)
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });  // ✅ Changed to .json()

        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ error: 'User already registered with this email.' });  // ✅ Changed to .json()

        // Create new user
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            isAdmin: req.body.isAdmin || false
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        // Save user
        await user.save();

        // ✅ Auto-create designer profile if role is designer
        if (req.body.role === 'designer') {
        const { DesignerProfile } = require('../models/DesignerProfile');
        const designerProfile = new DesignerProfile({
            user: user._id,
            businessName: req.body.businessName || `${req.body.name}'s Studio`,
            bio: req.body.bio || 'Tell clients about yourself.',
            specialties: req.body.specialties || ['casual_wear'],
        });
        await designerProfile.save();
        }

        // Generate token
        const token = user.generateAuthToken();

        // Send response (token in header, user data in body)
        res.header('x-auth-token', token).json({  // ✅ Changed .json() and removed redundant token
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Something went wrong: ' + error.message });  // ✅ Changed to .json()
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        // Validate request
        const { error } = Joi.object({
            email: Joi.string().min(5).max(255).required().email(),
            password: Joi.string().min(5).max(255).required()
        }).validate(req.body);

        if (error) return res.status(400).json({ error: error.details[0].message });

        // Check if user exists
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

        // Generate token
        const token = user.generateAuthToken();

        // Send token in header, user data in body
        res.header('x-auth-token', token).json({  // ✅ Changed to .json()
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user profile (Protected)
router.get('/me', auth, async (req, res) => {  // ✅ Removed array brackets (not needed)
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found.' });  // ✅ Changed to .json()

        res.json(user);  // ✅ Changed to .json()

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Something went wrong: ' + error.message });  // ✅ Changed to .json()
    }
});

module.exports = router;