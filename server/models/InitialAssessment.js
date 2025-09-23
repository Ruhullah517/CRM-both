const mongoose = require('mongoose');

const InitialAssessmentSchema = new mongoose.Schema({
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  assessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  answers: {
    over21: Boolean,
    location: String,
    spareRoom: Boolean,
    previousInvestigations: Boolean,
    safeguardingConcerns: Boolean,
    availabilityNotes: String,
    suitabilityNotes: String,
  },
  result: { type: String, enum: ['Pass', 'Fail', 'Needs More Info'], required: true },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InitialAssessment', InitialAssessmentSchema); 