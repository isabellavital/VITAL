const mongoose = require('mongoose');

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['text', 'multiple_choice', 'rating', 'checkbox']
    },
    options: [String],
    required: Boolean
  }],
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: String,
  responses: [{
    respondentName: String,
    respondentEmail: String,
    answers: [{
      questionId: String,
      answer: mongoose.Schema.Types.Mixed
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Survey', SurveySchema);
