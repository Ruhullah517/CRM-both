const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: 'New' },
  stage: { type: String, default: 'Inquiry' },
  mentor: String,
  deadline: Date,
  notes: [{ text: String, date: Date }],
  documents: [{ name: String, url: String }],
  email: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', CandidateSchema); 