const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const designerAuth = require('../middleware/designer');
const { DesignerProfile } = require('../models/DesignerProfile');
const { uploadToCloudinary } = require('../services/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, PNG and WebP allowed'));
  }
});

const RETURN_NEW = { returnDocument: 'after', runValidators: true };

// ── GET ALL DESIGNERS (public) ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { specialty, city, available } = req.query;
    const filter = {};
    if (specialty) filter.specialties = specialty;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (available) filter.availability = available === 'true';

    const designers = await DesignerProfile.find(filter)
      .populate('user', 'name email')
      .sort({ rating: -1 }).limit(50);

    res.json({ success: true, data: designers });
  } catch (err) {
    console.error('GET /designers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET ALL PORTFOLIO ITEMS (public) ─────────────────────────
router.get('/portfolio/all', async (req, res) => {
  try {
    const { category, search } = req.query;

    const designers = await DesignerProfile.find({ 'portfolio.0': { $exists: true } })
      .select('businessName profilePicture portfolio location specialties rating totalReviews pricing')
      .lean();

    let allItems = [];
    designers.forEach(designer => {
      designer.portfolio.forEach(item => {
        allItems.push({
          _id: item._id, image: item.image, title: item.title,
          description: item.description, category: item.category,
          isForSale: item.isForSale || false,   
          price:     item.price || 0,            
          createdAt: item.createdAt,
          designer: {
            _id: designer._id, businessName: designer.businessName,
            profilePicture: designer.profilePicture || null,
            location: designer.location, specialties: designer.specialties,
            rating: designer.rating, totalReviews: designer.totalReviews,
            pricing: designer.pricing
          }
        });
      });
    });

    if (category && category !== 'All') allItems = allItems.filter(i => i.category === category);
    if (search) {
      const term = search.toLowerCase();
      allItems = allItems.filter(i =>
        i.title?.toLowerCase().includes(term) ||
        i.description?.toLowerCase().includes(term) ||
        i.designer.businessName?.toLowerCase().includes(term)
      );
    }

    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: allItems.length, data: allItems });
  } catch (err) {
    console.error('GET /designers/portfolio/all error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET SINGLE PORTFOLIO ITEM (public) ───────────────────────
router.get('/portfolio/item/:itemId', async (req, res) => {
  try {
    const designer = await DesignerProfile.findOne({ 'portfolio._id': req.params.itemId })
      .select('businessName profilePicture portfolio location specialties rating totalReviews pricing availability responseTime bio experience')
      .lean();

    if (!designer) return res.status(404).json({ success: false, message: 'Product not found' });

    const item = designer.portfolio.find(p => p._id.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({
      success: true,
      data: {
        _id: item._id, image: item.image, title: item.title,
        description: item.description, category: item.category,
        isForSale: item.isForSale || false,  
        price:     item.price || 0,           
        createdAt: item.createdAt,
        designer: {
          _id: designer._id, businessName: designer.businessName,
          profilePicture: designer.profilePicture || null,
          location: designer.location, specialties: designer.specialties,
          rating: designer.rating, totalReviews: designer.totalReviews,
          pricing: designer.pricing, availability: designer.availability,
          responseTime: designer.responseTime, bio: designer.bio, experience: designer.experience
        }
      }
    });
  } catch (err) {
    console.error('GET /designers/portfolio/item/:itemId error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET MY PROFILE ────────────────────────────────────────────
router.get('/me/profile', [auth, designerAuth], async (req, res) => {
  try {
    const profile = await DesignerProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET SINGLE DESIGNER (public)
router.get('/:id', async (req, res) => {
  try {
    const profile = await DesignerProfile.findById(req.params.id).populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Designer not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── UPDATE MY PROFILE ─────────────────────────────────────────
router.put('/me/profile', [auth, designerAuth], async (req, res) => {
  try {
    const { businessName, bio, specialties, experience, pricing, location, availability, responseTime } = req.body;
    const updates = {};
    if (businessName)               updates.businessName = businessName;
    if (bio)                        updates.bio = bio;
    if (specialties)                updates.specialties = specialties;
    if (experience !== undefined)   updates.experience = experience;
    if (pricing)                    updates.pricing = pricing;
    if (location)                   updates.location = location;
    if (availability !== undefined) updates.availability = availability;
    if (responseTime)               updates.responseTime = responseTime;

    const profile = await DesignerProfile.findOneAndUpdate({ user: req.user._id }, updates, RETURN_NEW)
      .populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── UPLOAD PROFILE PICTURE ────────────────────────────────────
router.post('/me/profile-picture', [auth, designerAuth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const { url } = await uploadToCloudinary(req.file.buffer, 'mygarb/profile-pictures');
    const updatedProfile = await DesignerProfile.findOneAndUpdate({ user: req.user._id }, { profilePicture: url }, RETURN_NEW);
    if (!updatedProfile) return res.status(404).json({ success: false, message: 'Designer profile not found' });
    res.json({ success: true, data: { profilePicture: updatedProfile.profilePicture } });
  } catch (err) {
    console.error('POST /me/profile-picture error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADD PORTFOLIO ITEM / DESIGN ───────────────────────────────
router.post('/me/portfolio', [auth, designerAuth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });
    const { title, description, category, isForSale, price } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const { url } = await uploadToCloudinary(req.file.buffer, 'mygarb/portfolio');

    const updatedProfile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          portfolio: {
            image: url, title,
            description: description || '',
            category: category || '',
            isForSale: isForSale === 'true' || isForSale === true,  
            price: Number(price) || 0                                
          }
        }
      },
      RETURN_NEW
    );

    if (!updatedProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Design added', data: updatedProfile.portfolio });
  } catch (err) {
    console.error('POST /me/portfolio error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── EDIT DESIGN ───────────────────────────────────────────────
router.put('/me/portfolio/:imageId', [auth, designerAuth, upload.single('image')], async (req, res) => {
  try {
    const { title, description, category, isForSale, price } = req.body;
    const updates = {};
    if (title)                     updates['portfolio.$.title']       = title;
    if (description !== undefined) updates['portfolio.$.description'] = description;
    if (category !== undefined)    updates['portfolio.$.category']    = category;
    if (isForSale !== undefined)   updates['portfolio.$.isForSale']   = isForSale === 'true' || isForSale === true; // ✅
    if (price !== undefined)       updates['portfolio.$.price']       = Number(price) || 0;                         // ✅

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'mygarb/portfolio');
      updates['portfolio.$.image'] = url;
    }

    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

    const updatedProfile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id, 'portfolio._id': req.params.imageId },
      { $set: updates }, RETURN_NEW
    );

    if (!updatedProfile) return res.status(404).json({ success: false, message: 'Design not found' });
    const updatedItem = updatedProfile.portfolio.id(req.params.imageId);
    res.json({ success: true, message: 'Design updated', data: updatedItem });
  } catch (err) {
    console.error('PUT /me/portfolio/:imageId error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE DESIGN ─────────────────────────────────────────────
router.delete('/me/portfolio/:imageId', [auth, designerAuth], async (req, res) => {
  try {
    const updatedProfile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { portfolio: { _id: req.params.imageId } } },
      RETURN_NEW
    );
    if (!updatedProfile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, message: 'Design removed', data: updatedProfile.portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
