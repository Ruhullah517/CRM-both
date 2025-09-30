const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  type: {
    type: String,
    enum: [
      'Phone Call',
      'Email',
      'Client Meeting (Face to Face)',
      'Client Meeting (Online)',
      'Client Meeting (Home Visit)',
      'Client Meeting (Telephone)',
      'Internal Discussion',
      'Document Upload',
      'Case Update',
      'Follow-up Action'
    ],
    required: true
  },
  date: { type: Date, default: Date.now },
  caseworker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  timeSpent: { type: String, default: '00:00' }, // hh:mm
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema); 