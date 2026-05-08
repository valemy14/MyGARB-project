const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { Order } = require('../models/order');
const paystack = require('../services/paystack');
const { ServiceConfig, calculateServiceFee } = require('../models/ServiceConfig');

// Helper: get fee config from DB or use defaults
const DEFAULTS = { percentageFee: 2, baseFee: 1000, cap: 3500 };
async function getFeeConfig() {
  try {
    const config = await ServiceConfig.findOne({ key: 'platform_fee' });
    return config || DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

// ══════════════════════════════════════════════
// INIT — Start payment, calculate total with fee
// ══════════════════════════════════════════════
router.post('/init', auth, async (req, res) => {
  try {
    const {
      designer,
      agreedAmount,
       quoteId,
      serviceFee: clientServiceFee, // sent by frontend for display, but we recalculate server-side
      totalAmount: clientTotalAmount,
      orderDescription,
      collection,
      conversation,
      customMeasurements,
      shippingAddress
    } = req.body;

    // Validate required fields
    if (!designer)          return res.status(400).json({ success: false, message: 'Designer is required' });
    if (!agreedAmount)      return res.status(400).json({ success: false, message: 'Amount is required' });
    if (!orderDescription)  return res.status(400).json({ success: false, message: 'Order description is required' });
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
      return res.status(400).json({ success: false, message: 'Shipping address is incomplete' });
    }

    //  Validate agreed amount
    if (Number(agreedAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Agreed amount must be greater than 0' });
    }

    //  Recalculate service fee server-side — never trust client-sent fee amounts
    const feeConfig = await getFeeConfig();
    const feeBreakdown = calculateServiceFee(Number(agreedAmount), feeConfig);

    const finalServiceFee = feeBreakdown.serviceFee;
    const finalTotalAmount = feeBreakdown.total;

    console.log(`[/init] agreedAmount: ₦${agreedAmount}, serviceFee: ₦${finalServiceFee}, total: ₦${finalTotalAmount}`);

    // Charge the TOTAL (agreed + service fee) not just the agreed amount
    const transaction = await paystack.initializeTransaction({
      email: req.user.email,
      amount: finalTotalAmount, // was: agreedAmount — now includes service fee
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata: {
        customerId: req.user._id.toString(),
        orderPayload: {
           quoteId: quoteId || null,
          designer,
          agreedAmount:     Number(agreedAmount),
          serviceFee:       finalServiceFee,      //  stored in metadata
          totalAmount:      finalTotalAmount,      // stored in metadata
          feeConfig: {                             //  snapshot of config used for this transaction
            percentageFee: feeConfig.percentageFee,
            baseFee:       feeConfig.baseFee,
            cap:           feeConfig.cap
          },
          orderDescription,
          collection:          collection || null,
          conversation:        conversation || null,
          customMeasurements:  customMeasurements || {},
          shippingAddress
        }
      }
    });

    return res.json({
      success: true,
      authorizationUrl: transaction.authorization_url,
      reference:        transaction.reference,
      //  Return fee breakdown so frontend can confirm
      breakdown: {
        agreedAmount:  Number(agreedAmount),
        serviceFee:    finalServiceFee,
        totalAmount:   finalTotalAmount
      }
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

    // Check DB first — if order exists just return it
    const existing = await Order.findOne({ paymentReference: reference });
    if (existing) {
      return res.json({ success: true, message: 'Payment verified', order: existing });
    }

    const txn = await paystack.verifyTransaction(reference);

    if (txn.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment was not successful' });
    }

    const { orderPayload, customerId } = txn.metadata;

   
    const {
      serviceFee,
      totalAmount,
      feeConfig,
      ...restPayload
    } = orderPayload;

    restPayload.collection  = restPayload.collection  || null;
    restPayload.conversation = restPayload.conversation || null;

    const order = new Order({
      ...restPayload,
      user:             customerId,
         quote: restPayload.quoteId || null,
      //  Store all three amounts separately for platform tracking
      serviceFee:       serviceFee  || 0,
      totalAmount:      totalAmount || restPayload.agreedAmount,
      paymentStatus:    'paid',
      paymentReference: reference,
      transactionId:    String(txn.id),
      paidAt:           new Date(),
      status:           'confirmed',
      paymentMethod:    'paystack'
    });

    await order.save();

    // ✅ Create in-app notifications for both customer and designer
try {
  const Notification = require('../models/Notification');
  const { DesignerProfile } = require('../models/DesignerProfile');

  // Find the designer's user ID so we can notify them
  const designerProfile = await DesignerProfile.findById(restPayload.designer);

  // Notify customer
  await Notification.create({
    user:    customerId,
    message: `✅ Your order #${order.orderNumber} is confirmed! Your designer will begin working on your piece soon.`,
    type:    'order',
    link:    '/chat'
  });

  // Notify designer (only if we found their user account)
  if (designerProfile?.user) {
    await Notification.create({
      user:    designerProfile.user,
      message: `🎉 New order received! A customer just paid ₦${order.totalAmount?.toLocaleString()} for a custom piece. Order #${order.orderNumber}.`,
      type:    'order',
      link:    '/chat'
    });
  }
} catch (notifErr) {
  // Don't fail the whole verify if notification creation fails
  console.error('Notification creation error:', notifErr.message);
}

    // Update quote status to paid
    if (restPayload.quoteId) {
      const Quote = require('../models/Quote');
      await Quote.findByIdAndUpdate(restPayload.quoteId, {
        status: 'paid',
        paidAt: new Date()
      });
      console.log(`Quote ${restPayload.quoteId} marked as paid`);
    }

    console.log(`[/verify] Order created: ${order.orderNumber}, agreedAmount: ₦${order.agreedAmount}, serviceFee: ₦${order.serviceFee}, total: ₦${order.totalAmount}`);

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

      const updatedOrder = await Order.findOneAndUpdate(
        { paymentReference: reference, paymentStatus: { $ne: 'paid' } },
        {
          paymentStatus: 'paid',
          paidAt: new Date(),
          status: 'confirmed',
          transactionId: String(id)
        },
        { returnDocument: 'after' }
      );

      if (updatedOrder?.quote) {
        const Quote = require('../models/Quote');

        await Quote.findByIdAndUpdate(updatedOrder.quote, {
          status: 'paid',
          paidAt: new Date()
        });

        console.log(`Quote ${updatedOrder.quote} marked as paid (webhook)`);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook]', err.message);
    res.sendStatus(200);
  }
});

module.exports = router;
