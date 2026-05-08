const mongoose = require('mongoose');

// ══════════════════════════════════════════════════════════════
// ServiceConfig — stores platform fee settings in MongoDB
// so admin can update them without touching code
// ══════════════════════════════════════════════════════════════
const serviceConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true  // e.g. 'platform_fee'
  },

  // Fee percentage (e.g. 2 means 2%)
  percentageFee: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 2
  },

  // Minimum / base fee in Naira
  baseFee: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },

  // Maximum fee cap in Naira
  cap: {
    type: Number,
    required: true,
    min: 0,
    default: 3500
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

const ServiceConfig = mongoose.model('ServiceConfig', serviceConfigSchema);

// ── Fee calculation utility ────────────────────────────────────
// Called by both backend (payment init) and exposed via API
// to frontend for display purposes
function calculateServiceFee(agreedPrice, config = {}) {
  const {
    percentageFee = 2,
    baseFee       = 1000,
    cap           = 3500
  } = config;

  // Edge case: zero price → no fee
  if (agreedPrice === 0) return { serviceFee: 0, total: 0 };

  // Edge case: negative price → invalid
  if (agreedPrice < 0) throw new Error('Agreed price cannot be negative');

  const percentageAmount = (percentageFee / 100) * agreedPrice;
  const rawFee           = baseFee + percentageAmount;

  // Apply cap — never exceed cap
  let finalFee = Math.min(rawFee, cap);

  // Apply floor — never go below baseFee
  finalFee = Math.max(finalFee, baseFee);

  // Round to nearest whole Naira (no kobo)
  finalFee = Math.round(finalFee);

  const total = Math.round(agreedPrice + finalFee);

  return {
    agreedPrice:     Math.round(agreedPrice),
    percentageAmount: Math.round(percentageAmount),
    rawFee:          Math.round(rawFee),
    serviceFee:      finalFee,
    total
  };
}

module.exports = { ServiceConfig, calculateServiceFee };
