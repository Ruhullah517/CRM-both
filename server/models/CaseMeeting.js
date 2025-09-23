const mongoose = require('mongoose');

const CaseMeetingSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  meetingDate: { type: Date, required: true },
  meetingType: { type: String, enum: ['Telephone', 'Online', 'Home Visit', 'Face to Face', 'Other'], default: 'Other' },
  notes: { type: String },
  attachments: [
    {
      url: { type: String, required: true },
      name: { type: String },
      uploadedAt: { type: Date, default: Date.now },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaseMeeting', CaseMeetingSchema);


