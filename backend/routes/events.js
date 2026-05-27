const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { verifyToken } = require('./auth');
const multer = require('multer');
const path = require('path');

// Configure multer
const storage = multer.diskStorage({
  destination: 'uploads/events',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event (Admin only)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, location, capacity } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      time,
      location,
      capacity: capacity || 100,
      image: req.file ? `/uploads/events/${req.file.filename}` : null,
      adminId: req.admin.id,
      adminName: req.admin.username
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event (Admin only)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, time, location, capacity, status } = req.body;
    const updateData = {
      title,
      description,
      date,
      time,
      location,
      capacity: capacity || 100,
      status,
      updatedAt: Date.now()
    };
    
    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark interest in event
router.post('/:id/interested', async (req, res) => {
  try {
    const { userId, userName, email } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Check if already interested
    const exists = event.interestedUsers.find(u => u.userId === userId);
    if (exists) {
      event.interestedUsers = event.interestedUsers.filter(u => u.userId !== userId);
    } else {
      event.interestedUsers.push({ userId, userName, email });
    }
    
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get interested users count
router.get('/:id/interested-count', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json({ count: event.interestedUsers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
