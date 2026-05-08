const mongoose = require('mongoose');
const Joi = require('joi');

const designerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  businessName: { type: String, required: true, minlength: 3, maxlength: 100 },
  bio:          { type: String, required: true, minlength: 50, maxlength: 1000 },

  specialties: [{
    type: String,
    enum: ['suits','native_wear_men','native_wear_women','wedding_dresses',
           'casual_wear','corporate_wear','traditional_attire','unisex','children'],
    required: true
  }],

  experience:     { type: Number, min: 0, default: 0 },
  profilePicture: { type: String, default: null },

  portfolio: [{
    image:       { type: String, required: true },
    title:       { type: String, required: true },
    description: { type: String },
    category:    { type: String },
    // Fixed-price listing: when true, customers see Add to Cart
    isForSale:   { type: Boolean, default: false },
    price:       { type: Number, min: 0, default: 0 },
    createdAt:   { type: Date, default: Date.now }
  }],

  pricing:   { startingPrice: { type: Number, min: 0 }, currency: { type: String, default: 'NGN' } },
  location:  { city: String, state: String, country: { type: String, default: 'Nigeria' } },

  availability:    { type: Boolean, default: true },
  rating:          { type: Number, min: 0, max: 5, default: 0 },
  totalReviews:    { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  responseTime:    { type: String, default: 'Within 24 hours' },
  verified:        { type: Boolean, default: false }

}, { timestamps: true });

designerProfileSchema.index({ user: 1 }, { unique: true });
designerProfileSchema.index({ specialties: 1 });
designerProfileSchema.index({ rating: -1 });

const DesignerProfile = mongoose.model('DesignerProfile', designerProfileSchema);

function validateDesignerProfile(profile) {
  const schema = Joi.object({
    businessName: Joi.string().min(3).max(100).required(),
    bio:          Joi.string().min(50).max(1000).required(),
    specialties:  Joi.array().items(
      Joi.string().valid('suits','native_wear_men','native_wear_women','wedding_dresses',
                         'casual_wear','corporate_wear','traditional_attire','unisex','children')
    ).min(1).required(),
    experience:   Joi.number().min(0),
    pricing:      Joi.object({ startingPrice: Joi.number().min(0), currency: Joi.string().default('NGN') }),
    location:     Joi.object({ city: Joi.string(), state: Joi.string(), country: Joi.string().default('Nigeria') }),
    responseTime: Joi.string()
  });
  return schema.validate(profile);
}

exports.DesignerProfile = DesignerProfile;
exports.validate = validateDesignerProfile;
