const Joi = require('joi');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        
    },
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    designer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DesignerProfile',
        required: true
    },

    collection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        default: null
    },

    orderDescription: {
        type: String,
        required: true,
        maxlength: 1000
    },

    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        default: null
    },
    
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
    
    agreedAmount: {
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
        enum: ['paystack', 'flutterwave', 'bank_transfer', 'cash_on_delivery'],
        default: 'paystack'
    },
    
    paymentReference: {
    type: String,
    unique: true,  
    sparse: true,  
    default: null
},


transactionId: {
    type: String,
    default: null
},
    
    paidAt: {
        type: Date,
        default: null
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
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `MG${timestamp.slice(-6)}${random}`;
  }

  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid') {
    if (!this.paidAt) this.paidAt = new Date();
  }
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 }, {unique: true});

const Order = mongoose.model('Order', orderSchema);

// Validation for creating order
function validateOrder(order) {
  const schema = Joi.object({
    designer: Joi.string().required(),
    collection: Joi.string().allow(null, ''),
    conversation: Joi.string().allow(null, ''),
    agreedAmount: Joi.number().min(1).required(),
    orderDescription: Joi.string().max(1000).required(),
    customMeasurements: Joi.object({ /* keep as-is */ }).optional(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().default('Nigeria'),
      postalCode: Joi.string().allow('')
    }).required(),
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

// Validation for payment update
function validatePaymentUpdate(data) {
    const schema = Joi.object({
        paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required(),
        paymentReference: Joi.string().allow(''),
        transactionId: Joi.string().allow(''),
        paidAt: Joi.date().optional()
    });
    
    return schema.validate(data);
}

exports.Order = Order;
exports.validate = validateOrder;
exports.validateOrderStatus = validateOrderStatus;
exports.validateOrderCancel = validateOrderCancel;
exports.validatePaymentUpdate = validatePaymentUpdate;