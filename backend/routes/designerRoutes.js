const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const designer = require('../middleware/designer');
const { DesignerProfile, validate } = require('../models/DesignerProfile');
const { uploadToCloudinary } = require('../services/cloudinary');

// Multer — store in memory, send to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG and WebP images are allowed'));
    }
    cb(null, true);
  }
});

// ══════════════════════════════════════════════
// GET ALL DESIGNERS (public)
// ══════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const { specialty, city, available } = req.query;
    const filter = {};
    if (specialty) filter.specialties = specialty;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (available) filter.availability = available === 'true';

    const designers = await DesignerProfile.find(filter)
      .populate('user', 'name email')
      .sort({ rating: -1 })
      .limit(50);

    res.json({ success: true, data: designers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════
// GET SINGLE DESIGNER (public)
// ══════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const profile = await DesignerProfile.findById(req.params.id)
      .populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Designer not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════
// GET MY PROFILE (designer only)
// ══════════════════════════════════════════════
router.get('/me/profile', [auth, designer], async (req, res) => {
  try {
    const profile = await DesignerProfile.findOne({ user: req.user._id })
      .populate('user', 'name email');
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════
// UPDATE MY PROFILE (designer only)
// ══════════════════════════════════════════════
router.put('/me/profile', [auth, designer], async (req, res) => {
  try {
    const {
      businessName, bio, specialties, experience,
      pricing, location, availability, responseTime
    } = req.body;

    const updates = {};
    if (businessName) updates.businessName = businessName;
    if (bio) updates.bio = bio;
    if (specialties) updates.specialties = specialties;
    if (experience !== undefined) updates.experience = experience;
    if (pricing) updates.pricing = pricing;
    if (location) updates.location = location;
    if (availability !== undefined) updates.availability = availability;
    if (responseTime) updates.responseTime = responseTime;

    const profile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════
// UPLOAD PORTFOLIO IMAGE (designer only)
// ══════════════════════════════════════════════
router.post('/me/portfolio', [auth, designer, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image provided' });

    const { title, description, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // Upload to Cloudinary
    const { url } = await uploadToCloudinary(req.file.buffer, 'mygarb/portfolio');

    const profile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          portfolio: { image: url, title, description: description || '', category: category || '' }
        }
      },
      { new: true }
    );

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.json({ success: true, message: 'Image uploaded', data: profile.portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════
// DELETE PORTFOLIO IMAGE (designer only)
// ══════════════════════════════════════════════
router.delete('/me/portfolio/:imageId', [auth, designer], async (req, res) => {
  try {
    const profile = await DesignerProfile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { portfolio: { _id: req.params.imageId } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    res.json({ success: true, message: 'Image removed', data: profile.portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;