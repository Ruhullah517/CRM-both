const mongoose = require('mongoose');

const DataRetentionSchema = new mongoose.Schema({
  entityType: { 
    type: String, 
    required: true,
    enum: [
      'contact', 'enquiry', 'case', 'contract', 'freelancer', 'mentor',
      'training', 'invoice', 'email', 'email_template', 'reminder', 'audit_log'
    ]
  },
  retentionPeriod: { 
    type: Number, 
    required: true, 
    min: 0 // in days, 0 means no automatic deletion
  },
  autoDelete: { type: Boolean, default: false },
  anonymizeBeforeDelete: { type: Boolean, default: true },
  legalBasis: { 
    type: String, 
    enum: [
      'consent', 'contract', 'legal_obligation', 'vital_interests', 
      'public_task', 'legitimate_interests'
    ],
    required: true 
  },
  description: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
DataRetentionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DataRetention', DataRetentionSchema);
