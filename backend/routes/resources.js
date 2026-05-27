const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { verifyToken } = require('./auth');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/resources',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create resource (Admin only)
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, url, category } = req.body;
    
    const resource = new Resource({
      title,
      description,
      url: url || null,
      fileUrl: req.file ? `/uploads/resources/${req.file.filename}` : null,
      category,
      adminId: req.admin.id,
      adminName: req.admin.username
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update resource (Admin only)
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, url, category } = req.body;
    const updateData = {
      title,
      description,
      url: url || null,
      category,
      updatedAt: Date.now()
    };
    
    if (req.file) {
      updateData.fileUrl = `/uploads/resources/${req.file.filename}`;
    }
    
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete resource (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
