const mongoose = require('mongoose');
const Joi = require('joi');

const collectionSchema = new mongoose.Schema({
  designer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignerProfile',
    required: true
  },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 1000 },
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['suits', 'native_wear_men', 'native_wear_women', 'wedding_dresses',
           'casual_wear', 'corporate_wear', 'traditional_attire', 'unisex', 'children'],
    required: true
  },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'NGN' },
  available: { type: Boolean, default: true }
}, { timestamps: true });

collectionSchema.index({ designer: 1 });
collectionSchema.index({ category: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

function validateCollection(data) {
  const schema = Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(1000).allow(''),
    images: Joi.array().items(Joi.string()),
    category: Joi.string().valid(
      'suits', 'native_wear_men', 'native_wear_women', 'wedding_dresses',
      'casual_wear', 'corporate_wear', 'traditional_attire', 'unisex', 'children'
    ).required(),
    price: Joi.number().min(0).required(),
    available: Joi.boolean()
  });
  return schema.validate(data);
}

exports.Collection = Collection;
exports.validate = validateCollection;