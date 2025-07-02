const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  skills: [String],
  status: String,
  avatar: String,
  mentees: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mentor', MentorSchema); 