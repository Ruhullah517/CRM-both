const mongoose = require('mongoose');

const FullAssessmentSchema = new mongoose.Schema({
  enquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  assessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  checksDone: [String], // e.g., ['DBS','References']
  documents: [
    {
      type: { type: String },
      url: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  homeSafetyCheck: String,
  personalHistory: String,
  motivations: String,
  supportNeeds: String,
  trainingNeeds: String,
  meetingNotes: String,
  recommendation: { type: String, enum: ['Proceed', 'Do not proceed', 'Hold'], required: true },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FullAssessment', FullAssessmentSchema);



