const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { ServiceConfig, calculateServiceFee } = require('../models/ServiceConfig');

// Default config values — used if DB has no record yet
const DEFAULTS = { percentageFee: 2, baseFee: 1000, cap: 3500 };

// Helper: get config from DB or fall back to defaults
async function getConfig() {
  const config = await ServiceConfig.findOne({ key: 'platform_fee' });
  return config || DEFAULTS;
}

// ══════════════════════════════════════════════════════════════
// GET /api/mygarb/config/service-fee
// Public — frontend fetches this at checkout to display fee breakdown
// ══════════════════════════════════════════════════════════════
router.get('/service-fee', async (req, res) => {
  try {
    const config = await getConfig();

    res.json({
      success: true,
      data: {
        percentageFee: config.percentageFee,
        baseFee:       config.baseFee,
        cap:           config.cap
      }
    });
  } catch (err) {
    console.error('GET /config/service-fee error:', err);
    //  Return defaults if DB fails — checkout should never be blocked by this
    res.json({
      success: true,
      data: DEFAULTS,
      fallback: true
    });
  }
});

// ══════════════════════════════════════════════════════════════
// GET /api/mygarb/config/service-fee/calculate?price=5000
// Public — returns calculated fee for a given price
// Frontend can call this to verify fee before payment
// ══════════════════════════════════════════════════════════════
router.get('/service-fee/calculate', async (req, res) => {
  try {
    const price = Number(req.query.price);

    if (isNaN(price)) {
      return res.status(400).json({ success: false, message: 'price must be a number' });
    }

    const config = await getConfig();
    const result = calculateServiceFee(price, config);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('GET /config/service-fee/calculate error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// PUT /api/mygarb/config/service-fee
// Admin only — update fee configuration
// ══════════════════════════════════════════════════════════════
router.put('/service-fee', [auth, admin], async (req, res) => {
  try {
    const { percentageFee, baseFee, cap } = req.body;

    // Validate inputs
    if (percentageFee !== undefined && (percentageFee < 0 || percentageFee > 100)) {
      return res.status(400).json({ success: false, message: 'percentageFee must be between 0 and 100' });
    }
    if (baseFee !== undefined && baseFee < 0) {
      return res.status(400).json({ success: false, message: 'baseFee cannot be negative' });
    }
    if (cap !== undefined && cap < 0) {
      return res.status(400).json({ success: false, message: 'cap cannot be negative' });
    }

    const updates = { updatedBy: req.user._id };
    if (percentageFee !== undefined) updates.percentageFee = percentageFee;
    if (baseFee       !== undefined) updates.baseFee       = baseFee;
    if (cap           !== undefined) updates.cap           = cap;

    // Upsert — create if doesn't exist, update if it does
    const config = await ServiceConfig.findOneAndUpdate(
      { key: 'platform_fee' },
      { $set: updates },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Service fee configuration updated',
      data: {
        percentageFee: config.percentageFee,
        baseFee:       config.baseFee,
        cap:           config.cap
      }
    });
  } catch (err) {
    console.error('PUT /config/service-fee error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
