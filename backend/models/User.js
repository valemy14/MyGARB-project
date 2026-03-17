const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024
    },
    
    role: {
    type: String,
    enum: ['customer', 'tailor', 'vendor'],
    default: 'customer',
    required: true
  },
    
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Generate JWT Token
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { 
            _id: this._id, 
            name: this.name, 
            email: this.email,
            role: this.role,
            isAdmin: this.isAdmin
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};

const User = mongoose.model('User', userSchema);

// Validation for user registration
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required(),
        role: Joi.string().valid('customer', 'tailor', 'vendor').required(),
        isAdmin: Joi.boolean().optional()  
    });
    return schema.validate(user);
}

// Validation for login
function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(req);
}

exports.User = User;
exports.validate = validateUser;
exports.validateLogin = validateLogin;