const { User, validate, validateLogin } = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
    try {
        // Validate input
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send('User already registered with this email.');

        // Create new user
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin: req.body.isAdmin || false
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        // Save user
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        // Send response
        res.header('x-auth-token', token).send({
            token: token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        // Validate input
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send('Invalid email or password.');

        // Check password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send('Invalid email or password.');

        // Generate token
        const token = user.generateAuthToken();

        // Send response
        res.header('x-auth-token', token).send({
            token: token,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.isAdmin
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get current user profile (Protected)
router.get('/me', [auth], async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).send('User not found.');

        res.send(user);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

module.exports = router;