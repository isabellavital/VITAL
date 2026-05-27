const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const { verifyToken } = require('./auth');

// Get all surveys
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ active: true });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single survey
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Not found' });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create survey (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    
    const survey = new Survey({
      title,
      description,
      questions,
      adminId: req.admin.id,
      adminName: req.admin.username
    });
    
    await survey.save();
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update survey (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, questions, active } = req.body;
    
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        questions,
        active,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit survey response
router.post('/:id/submit', async (req, res) => {
  try {
    const { respondentName, respondentEmail, answers } = req.body;
    const survey = await Survey.findById(req.params.id);
    
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    
    survey.responses.push({
      respondentName,
      respondentEmail,
      answers
    });
    
    await survey.save();
    res.json({ message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get survey results (Admin only)
router.get('/:id/results', verifyToken, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    res.json(survey.responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete survey (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Survey.findByIdAndDelete(req.params.id);
    res.json({ message: 'Survey deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
