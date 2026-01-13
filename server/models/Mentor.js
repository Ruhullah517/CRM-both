const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,
  skills: [String],
  specialization: String,
  qualifications: String,
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  avatar: String,
  mentees: [String],
  notes: String,
  // Source tracking (if created from freelancer)
  source: { type: String, enum: ['direct', 'freelancer'], default: 'direct' },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
  // Mentor-specific dates
  joinDate: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mentor', MentorSchema); 