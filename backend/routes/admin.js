const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Application = require('../models/Application');
const Survey = require('../models/Survey');

// Admin Dashboard Stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const announcementCount = await Announcement.countDocuments();
    const eventCount = await Event.countDocuments();
    const applicationCount = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    res.json({
      announcements: announcementCount,
      events: eventCount,
      applications: applicationCount,
      pendingApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admin data (for full site management)
router.get('/data/all', verifyToken, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const events = await Event.find().sort({ date: 1 });
    const applications = await Application.find().sort({ createdAt: -1 });
    const surveys = await Survey.find().sort({ createdAt: -1 });
    
    res.json({
      announcements,
      events,
      applications,
      surveys
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
