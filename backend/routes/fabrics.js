const { Fabric, validate, validateUpdate } = require('../models/fabric');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all fabrics (Public)
router.get('/', async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            inStock,
            featured,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 12
        } = req.query;

        // Build query
        const query = {};

        if (category) query.category = category;
        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (inStock !== undefined) query.inStock = inStock === 'true';
        if (featured !== undefined) query.featured = featured === 'true';
        
        if (search) query.$text = { $search: search };

        // Pagination
        const skip = (page - 1) * limit;
        
        const fabrics = await Fabric.find(query)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .select('-__v');

        const total = await Fabric.countDocuments(query);

        res.send({
            success: true,
            count: fabrics.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: fabrics
        });

    } catch (error) {
        console.error('Get fabrics error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get featured fabrics (Public)
router.get('/featured', async (req, res) => {
    try {
        const limit = req.query.limit || 6;

        const fabrics = await Fabric.find({ featured: true, inStock: true })
            .sort('-createdAt')
            .limit(Number(limit))
            .select('-__v');

        res.send({
            success: true,
            count: fabrics.length,
            data: fabrics
        });

    } catch (error) {
        console.error('Get featured fabrics error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get categories with counts (Public)
router.get('/stats/categories', async (req, res) => {
    try {
        const categories = await Fabric.aggregate([
            { $match: { inStock: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.send({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get fabrics by category (Public)
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12 } = req.query;

        const validCategories = ['Ankara', 'Silk', 'Lace', 'Cotton', 'Velvet', 'Chiffon', 'Satin', 'Brocade', 'Other'];
        
        if (!validCategories.includes(category)) {
            return res.status(400).send('Invalid category');
        }

        const skip = (page - 1) * limit;

        const fabrics = await Fabric.find({ category, inStock: true })
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit))
            .select('-__v');

        const total = await Fabric.countDocuments({ category, inStock: true });

        res.send({
            success: true,
            category,
            count: fabrics.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: fabrics
        });

    } catch (error) {
        console.error('Get fabrics by category error:', error);
        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Get single fabric by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const fabric = await Fabric.findById(req.params.id);

        if (!fabric) return res.status(404).send('Fabric not found');

        // Increment views
        fabric.views += 1;
        await fabric.save();

        res.send({
            success: true,
            data: fabric
        });

    } catch (error) {
        console.error('Get fabric error:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).send('Fabric not found');
        }

        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Create new fabric (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const fabric = new Fabric({
            ...req.body,
            createdBy: req.user._id
        });

        await fabric.save();

        res.send({
            success: true,
            message: 'Fabric created successfully',
            data: fabric
        });

    } catch (error) {
        console.error('Create fabric error:', error);

        if (error.code === 11000) {
            return res.status(400).send('Fabric with this name already exists');
        }

        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Update fabric (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        const { error } = validateUpdate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let fabric = await Fabric.findById(req.params.id);
        if (!fabric) return res.status(404).send('Fabric not found');

        fabric = await Fabric.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.send({
            success: true,
            message: 'Fabric updated successfully',
            data: fabric
        });

    } catch (error) {
        console.error('Update fabric error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(404).send('Fabric not found');
        }

        res.status(500).send('Something went wrong: ' + error.message);
    }
});

// Delete fabric (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const fabric = await Fabric.findById(req.params.id);
        if (!fabric) return res.status(404).send('Fabric not found');

        await fabric.deleteOne();

        res.send({
            success: true,
            message: 'Fabric deleted successfully'
        });

    } catch (error) {
        console.error('Delete fabric error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(404).send('Fabric not found');
        }

        res.status(500).send('Something went wrong: ' + error.message);
    }
});

module.exports = router;