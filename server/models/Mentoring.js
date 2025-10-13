const mongoose = require('mongoose');

const MentoringSchema = new mongoose.Schema({
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  startDate: { type: Date, default: Date.now },
  meetingSchedule: String,
  status: { type: String, enum: ['Active Mentoring', 'On Hold', 'Escalated', 'Closed'], default: 'Active Mentoring' },
  sessions: [
    {
      date: Date,
      attendees: [String],
      notes: String,
      actions: String
    }
  ],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mentoring', MentoringSchema);







