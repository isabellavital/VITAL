const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { verifyToken } = require('./auth');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/announcements',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement (Admin only)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, featured } = req.body;
    
    const announcement = new Announcement({
      title,
      description,
      image: req.file ? `/uploads/announcements/${req.file.filename}` : null,
      adminId: req.admin.id,
      adminName: req.admin.username,
      featured: featured === 'true'
    });
    
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update announcement (Admin only)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, featured } = req.body;
    const updateData = {
      title,
      description,
      featured: featured === 'true',
      updatedAt: Date.now()
    };
    
    if (req.file) {
      updateData.image = `/uploads/announcements/${req.file.filename}`;
    }
    
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete announcement (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
