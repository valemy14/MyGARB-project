const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { Order } = require('../models/order');
const paystack = require('../services/paystack');

// ══════════════════════════════════════════════
// INIT — Start payment, no order saved yet
// ══════════════════════════════════════════════
router.post('/init', auth, async (req, res) => {
  try {
    const {
      designer,
      agreedAmount,
      orderDescription,
      collection,
      conversation,
      customMeasurements,
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!designer) return res.status(400).json({ success: false, message: 'Designer is required' });
    if (!agreedAmount) return res.status(400).json({ success: false, message: 'Amount is required' });
    if (!orderDescription) return res.status(400).json({ success: false, message: 'Order description is required' });
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({ success: false, message: 'Shipping address is incomplete' });
    }

    // Initialize Paystack — NO order saved yet
    const transaction = await paystack.initializeTransaction({
      email: req.user.email,
      amount: agreedAmount,
      metadata: {
        customerId: req.user._id.toString(),
        orderPayload: {
            designer,
            agreedAmount,
            orderDescription,
            collection: collection || null,      
            conversation: conversation || null, 
            customMeasurements: customMeasurements || {},
            shippingAddress
        }
        }
    });

    return res.json({
      success: true,
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference
    });

  } catch (err) {
    console.error('[/init]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to initialize payment' });
  }
});

// ══════════════════════════════════════════════
// VERIFY — Confirm payment & create order
// ══════════════════════════════════════════════
router.post('/verify', auth, async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ success: false, message: 'Reference is required' });

    // ✅ Check DB first — if order exists just return it, don't call Paystack again
    const existing = await Order.findOne({ paymentReference: reference });
    if (existing) {
      return res.json({ success: true, message: 'Payment verified', order: existing });
    }

    // Only call Paystack if order doesn't exist yet
    const txn = await paystack.verifyTransaction(reference);

    if (txn.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment was not successful' });
    }

    const { orderPayload, customerId } = txn.metadata;

    orderPayload.collection = orderPayload.collection || null;
    orderPayload.conversation = orderPayload.conversation || null;


    const order = new Order({
      ...orderPayload,
      user: customerId,
      paymentStatus: 'paid',
      paymentReference: reference,
      transactionId: String(txn.id),
      paidAt: new Date(),
      status: 'confirmed',
      paymentMethod: 'paystack'
    });

    await order.save();

    return res.json({ success: true, message: 'Payment verified', order });

  } catch (err) {
    console.error('[/verify]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to verify payment' });
  }
});
// ══════════════════════════════════════════════
// WEBHOOK — backup (signature verified)
// ══════════════════════════════════════════════
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest('hex');

    if (signature !== hash) return res.sendStatus(401);

    const event = JSON.parse(req.body);

    if (event.event === 'charge.success') {
      const { reference, id } = event.data;
      // Safety net only — update if order exists but wasn't marked paid
      await Order.findOneAndUpdate(
        { paymentReference: reference, paymentStatus: { $ne: 'paid' } },
        { paymentStatus: 'paid', paidAt: new Date(), status: 'confirmed', transactionId: String(id) }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook]', err.message);
    res.sendStatus(200);
  }
});

module.exports = router;