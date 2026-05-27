const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken } = require('./auth');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/applications',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all applications (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit application
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { fullName, email, phone, position, message } = req.body;
    
    const application = new Application({
      fullName,
      email,
      phone,
      position,
      message,
      resume: req.file ? `/uploads/applications/${req.file.filename}` : null
    });
    
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        reviewedBy: req.admin.id,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete application (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
