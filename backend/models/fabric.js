const Joi = require('joi');
const mongoose = require('mongoose');

const fabricSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 2000
    },
    
    category: {
        type: String,
        required: true,
        enum: ['Ankara', 'Silk', 'Lace', 'Cotton', 'Velvet', 'Chiffon', 'Satin', 'Brocade', 'Other']
    },
    
    price: {
        type: Number,
        required: true,
        min: 0
    },
    
    priceUnit: {
        type: String,
        enum: ['per_yard', 'per_meter', 'per_piece'],
        default: 'per_yard'
    },
    
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: 'Fabric image' }
    }],
    
    colors: [{ type: String }],
    
    material: { type: String },
    
    composition: { type: String, maxlength: 500 },
    
    careInstructions: { type: String, maxlength: 1000 },
    
    width: {
        value: { type: Number },
        unit: { type: String, enum: ['inches', 'cm'], default: 'inches' }
    },
    
    weight: { type: String },
    
    texture: { type: String },
    
    stock: {
        quantity: { type: Number, required: true, min: 0, default: 0 },
        unit: { type: String, enum: ['yards', 'meters', 'pieces'], default: 'yards' }
    },
    
    inStock: { type: Boolean, default: true },
    
    featured: { type: Boolean, default: false },
    
    tags: [{ type: String, lowercase: true }],
    
    vendor: { type: String },
    
    rating: {
        average: { type: Number, min: 0, max: 5, default: 0 },
        count: { type: Number, default: 0 }
    },
    
    views: { type: Number, default: 0 },
    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes
fabricSchema.index({ name: 'text', description: 'text', tags: 'text' });
fabricSchema.index({ category: 1, featured: -1 });

// Update inStock based on quantity
fabricSchema.pre('save', function(next) {
    this.inStock = this.stock.quantity > 0;
    next();
});

const Fabric = mongoose.model('Fabric', fabricSchema);

// Validation function for creating fabric
function validateFabric(fabric) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(2000).required(),
        category: Joi.string().valid('Ankara', 'Silk', 'Lace', 'Cotton', 'Velvet', 'Chiffon', 'Satin', 'Brocade', 'Other').required(),
        price: Joi.number().min(0).required(),
        priceUnit: Joi.string().valid('per_yard', 'per_meter', 'per_piece').default('per_yard'),
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                alt: Joi.string().default('Fabric image')
            })
        ).min(1).required(),
        colors: Joi.array().items(Joi.string()),
        material: Joi.string().allow(''),
        composition: Joi.string().max(500).allow(''),
        careInstructions: Joi.string().max(1000).allow(''),
        width: Joi.object({
            value: Joi.number().min(0),
            unit: Joi.string().valid('inches', 'cm').default('inches')
        }),
        weight: Joi.string().allow(''),
        texture: Joi.string().allow(''),
        stock: Joi.object({
            quantity: Joi.number().min(0).required(),
            unit: Joi.string().valid('yards', 'meters', 'pieces').default('yards')
        }).required(),
        featured: Joi.boolean().default(false),
        tags: Joi.array().items(Joi.string()),
        vendor: Joi.string().allow('')
    });
    
    return schema.validate(fabric);
}

// Validation for updating fabric
function validateFabricUpdate(fabric) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(100),
        description: Joi.string().min(10).max(2000),
        category: Joi.string().valid('Ankara', 'Silk', 'Lace', 'Cotton', 'Velvet', 'Chiffon', 'Satin', 'Brocade', 'Other'),
        price: Joi.number().min(0),
        priceUnit: Joi.string().valid('per_yard', 'per_meter', 'per_piece'),
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                alt: Joi.string()
            })
        ),
        colors: Joi.array().items(Joi.string()),
        material: Joi.string().allow(''),
        composition: Joi.string().max(500).allow(''),
        careInstructions: Joi.string().max(1000).allow(''),
        width: Joi.object({
            value: Joi.number().min(0),
            unit: Joi.string().valid('inches', 'cm')
        }),
        weight: Joi.string().allow(''),
        texture: Joi.string().allow(''),
        stock: Joi.object({
            quantity: Joi.number().min(0),
            unit: Joi.string().valid('yards', 'meters', 'pieces')
        }),
        featured: Joi.boolean(),
        tags: Joi.array().items(Joi.string()),
        vendor: Joi.string().allow('')
    });
    
    return schema.validate(fabric);
}

exports.Fabric = Fabric;
exports.validate = validateFabric;
exports.validateUpdate = validateFabricUpdate;