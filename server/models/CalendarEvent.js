const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  startTime: String,
  endTime: String,
  type: {
    type: String,
    enum: ['training', 'meeting', 'deadline', 'case', 'other'],
    default: 'other'
  },
  location: String,
  attendees: String, // Comma-separated list
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
CalendarEventSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
