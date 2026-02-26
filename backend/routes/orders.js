const { Order, validate, validateOrderStatus, validateOrderCancel } = require('../models/order');
const { Fabric } = require('../models/fabric');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all orders (Admin only)
router.get('/admin/all', auth, admin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        
        const skip = (page - 1) * limit;
        
        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));
        
        const total = await Order.countDocuments(query);
        
        res.send({
            success: true,
            count: orders.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: orders
        });
        
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get user's own orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = { user: req.user._id };
        if (status) query.status = status;
        
        const skip = (page - 1) * limit;
        
        const orders = await Order.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));
        
        const total = await Order.countDocuments(query);
        
        res.send({
            success: true,
            count: orders.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: orders
        });
        
    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.fabric');
        
        if (!order) return res.status(404).send('Order not found');
        
        // Check if user owns this order or is admin
        if (order.user._id.toString() !== req.user._id && !req.user.isAdmin) {
            return res.status(403).send('Access denied. You can only view your own orders.');
        }
        
        res.send({
            success: true,
            data: order
        });
        
    } catch (error) {
        console.error('Get order error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).send('Order not found');
        }
        
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        // Process items and calculate totals
        const processedItems = [];
        let totalAmount = 0;
        
        for (const item of req.body.items) {
            // Get fabric details
            const fabric = await Fabric.findById(item.fabric);
            if (!fabric) {
                return res.status(400).send(`Fabric not found: ${item.fabric}`);
            }
            
            if (!fabric.inStock) {
                return res.status(400).send(`Fabric out of stock: ${fabric.name}`);
            }
            
            if (fabric.stock.quantity < item.quantity) {
                return res.status(400).send(`Insufficient stock for ${fabric.name}. Available: ${fabric.stock.quantity}`);
            }
            
            // Calculate subtotal
            const subtotal = fabric.price * item.quantity;
            totalAmount += subtotal;
            
            processedItems.push({
                fabric: fabric._id,
                fabricName: fabric.name,
                quantity: item.quantity,
                unit: item.unit || fabric.stock.unit,
                price: fabric.price,
                subtotal
            });
            
            // Update fabric stock
            fabric.stock.quantity -= item.quantity;
            await fabric.save();
        }
        
        // Create order
        const order = new Order({
            user: req.user._id,
            items: processedItems,
            customMeasurements: req.body.customMeasurements,
            designNotes: req.body.designNotes,
            stylePreferences: req.body.stylePreferences,
            shippingAddress: req.body.shippingAddress,
            totalAmount,
            paymentMethod: req.body.paymentMethod || 'paystack',
            notes: req.body.notes
        });
        
        await order.save();
        
        // Populate for response
        await order.populate('user', 'name email');
        await order.populate('items.fabric');
        
        res.send({
            success: true,
            message: 'Order created successfully',
            data: order
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Update order status (Admin only)
router.put('/:id/status', auth, admin, async (req, res) => {
    try {
        const { error } = validateOrderStatus(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).send('Order not found');
        
        order.status = req.body.status;
        
        if (req.body.notes) {
            order.notes = req.body.notes;
        }
        
        if (req.body.status === 'cancelled') {
            order.cancelledAt = Date.now();
        }
        
        await order.save();
        
        await order.populate('user', 'name email');
        await order.populate('items.fabric');
        
        res.send({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).send('Order not found');
        }
        
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Cancel order (User can cancel their own pending orders)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const { error } = validateOrderCancel(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).send('Order not found');
        
        // Check if user owns this order
        if (order.user.toString() !== req.user._id && !req.user.isAdmin) {
            return res.status(403).send('Access denied. You can only cancel your own orders.');
        }
        
        // Can only cancel pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).send('Order cannot be cancelled at this stage');
        }
        
        order.status = 'cancelled';
        order.cancelledAt = Date.now();
        order.cancelReason = req.body.cancelReason;
        
        // Restore fabric stock
        for (const item of order.items) {
            const fabric = await Fabric.findById(item.fabric);
            if (fabric) {
                fabric.stock.quantity += item.quantity;
                await fabric.save();
            }
        }
        
        await order.save();
        
        res.send({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
        
    } catch (error) {
        console.error('Cancel order error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).send('Order not found');
        }
        
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get order statistics (Admin only)
router.get('/admin/stats', auth, admin, async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);
        
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        
        res.send({
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                byStatus: stats
            }
        });
        
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

module.exports = router;