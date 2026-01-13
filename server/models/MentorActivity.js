const mongoose = require('mongoose');

const MentorActivitySchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  activityType: {
    type: String,
    enum: ['assignment', 'assignment_log', 'meeting', 'note', 'follow_up', 'completion', 'update'],
    required: true
  },
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
  parentAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'MentorActivity' },
  date: { type: Date, default: Date.now },
  title: { type: String },
  description: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enquiryDetails: {
    enquiryName: String,
    enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' }
  },
  meetingSchedule: Date,
  timeSpent: String, // Format: "HH:MM"
  status: { type: String, enum: ['active', 'completed'], default: 'active' }, // For assignments
  completedAt: Date, // When assignment was completed
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who marked it complete
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MentorActivity', MentorActivitySchema);

