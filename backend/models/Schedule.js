const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  time: String,
  location: String,
  type: {
    type: String,
    enum: ['meeting', 'event', 'workshop', 'other'],
    default: 'meeting'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  adminName: String,
  interestedCount: {
    type: Number,
    default: 0
  },
  interestedUsers: [{
    userId: String,
    userName: String,
    email: String,
    markedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
