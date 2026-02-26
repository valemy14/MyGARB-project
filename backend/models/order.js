const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        
    },
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    items: [{
        fabric: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fabric',
            required: true
        },
        fabricName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unit: {
            type: String,
            enum: ['yards', 'meters', 'pieces'],
            default: 'yards'
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    
    customMeasurements: {
        chest: { type: Number },
        waist: { type: Number },
        hips: { type: Number },
        shoulder: { type: Number },
        sleeveLength: { type: Number },
        length: { type: Number },
        inseam: { type: Number },
        neck: { type: Number },
        armhole: { type: Number },
        wrist: { type: Number },
        measurementUnit: {
            type: String,
            enum: ['inches', 'cm'],
            default: 'inches'
        },
        notes: { type: String, maxlength: 1000 }
    },
    
    designNotes: {
        type: String,
        maxlength: 2000
    },
    
    stylePreferences: [{
        type: String
    }],
    
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'Nigeria'
        },
        postalCode: {
            type: String
        }
    },
    
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    
    paymentMethod: {
        type: String,
        enum: ['paystack', 'bank_transfer', 'cash_on_delivery'],
        default: 'paystack'
    },
    
    paymentReference: {
        type: String
    },
    
    estimatedDeliveryDate: {
        type: Date
    },
    
    notes: {
        type: String,
        maxlength: 1000
    },
    
    cancelledAt: {
        type: Date
    },
    
    cancelReason: {
        type: String,
        maxlength: 500
    }
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `MG${timestamp.slice(-6)}${random}`;
    }
   
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

// Validation for creating order
function validateOrder(order) {
    const schema = Joi.object({
        items: Joi.array().items(
            Joi.object({
                fabric: Joi.string().required(),
                quantity: Joi.number().min(1).required(),
                unit: Joi.string().valid('yards', 'meters', 'pieces').default('yards')
            })
        ).min(1).required(),
        
        customMeasurements: Joi.object({
            chest: Joi.number().min(0),
            waist: Joi.number().min(0),
            hips: Joi.number().min(0),
            shoulder: Joi.number().min(0),
            sleeveLength: Joi.number().min(0),
            length: Joi.number().min(0),
            inseam: Joi.number().min(0),
            neck: Joi.number().min(0),
            armhole: Joi.number().min(0),
            wrist: Joi.number().min(0),
            measurementUnit: Joi.string().valid('inches', 'cm').default('inches'),
            notes: Joi.string().max(1000).allow('')
        }).optional(),
        
        designNotes: Joi.string().max(2000).allow(''),
        
        stylePreferences: Joi.array().items(Joi.string()),
        
        shippingAddress: Joi.object({
            fullName: Joi.string().required(),
            phone: Joi.string().required(),
            address: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().default('Nigeria'),
            postalCode: Joi.string().allow('')
        }).required(),
        
        paymentMethod: Joi.string().valid('paystack', 'bank_transfer', 'cash_on_delivery').default('paystack'),
        
        notes: Joi.string().max(1000).allow('')
    });
    
    return schema.validate(order);
}

// Validation for updating order status (admin)
function validateOrderStatus(data) {
    const schema = Joi.object({
        status: Joi.string().valid('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled').required(),
        notes: Joi.string().max(1000).allow('')
    });
    
    return schema.validate(data);
}

// Validation for cancelling order
function validateOrderCancel(data) {
    const schema = Joi.object({
        cancelReason: Joi.string().max(500).required()
    });
    
    return schema.validate(data);
}

exports.Order = Order;
exports.validate = validateOrder;
exports.validateOrderStatus = validateOrderStatus;
exports.validateOrderCancel = validateOrderCancel;