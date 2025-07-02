const mongoose = require('mongoose');

const InitialAssessmentSchema = new mongoose.Schema({
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assessment_notes: String,
  assessment_date: Date,
  attachments: String,
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InitialAssessment', InitialAssessmentSchema); 