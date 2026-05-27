const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { verifyToken } = require('./auth');

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ startDate: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create schedule (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, time, location, type } = req.body;
    
    const schedule = new Schedule({
      title,
      description,
      startDate,
      endDate,
      time,
      location,
      type,
      adminId: req.admin.id,
      adminName: req.admin.username
    });
    
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update schedule (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate, time, location, type } = req.body;
    
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        startDate,
        endDate,
        time,
        location,
        type,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete schedule (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark interest in schedule
router.post('/:id/interested', async (req, res) => {
  try {
    const { userId, userName, email } = req.body;
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    
    // Check if already interested
    const exists = schedule.interestedUsers.find(u => u.userId === userId);
    if (exists) {
      schedule.interestedUsers = schedule.interestedUsers.filter(u => u.userId !== userId);
      schedule.interestedCount--;
    } else {
      schedule.interestedUsers.push({ userId, userName, email });
      schedule.interestedCount++;
    }
    
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
