const mongoose = require('mongoose');

const FreelancerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  status: String,
  availability: String,
  email: String,
  skills: [String],
  complianceDocs: [String],
  assignments: [String],
  contract_date: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Freelancer', FreelancerSchema); 