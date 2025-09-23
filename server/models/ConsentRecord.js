const mongoose = require('mongoose');

const ConsentRecordSchema = new mongoose.Schema({
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  contactEmail: { type: String, required: true },
  consentType: { 
    type: String, 
    required: true,
    enum: [
      'marketing', 'training_updates', 'newsletters', 'case_updates',
      'invoice_notifications', 'reminder_emails', 'data_processing',
      'data_sharing', 'analytics', 'cookies'
    ]
  },
  consentGiven: { type: Boolean, required: true },
  consentMethod: { 
    type: String, 
    enum: ['email', 'website', 'phone', 'in_person', 'api', 'import'],
    required: true 
  },
  consentText: String, // The exact text the user consented to
  consentVersion: { type: String, required: true }, // Version of privacy policy/terms
  ipAddress: String,
  userAgent: String,
  givenAt: { type: Date, required: true },
  withdrawnAt: Date,
  withdrawalMethod: String,
  withdrawalReason: String,
  isActive: { type: Boolean, default: true },
  metadata: {
    source: String, // Where consent was given (e.g., 'contact_form', 'email_signup')
    campaign: String, // Marketing campaign if applicable
    referrer: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
ConsentRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient querying
ConsentRecordSchema.index({ contactId: 1, consentType: 1, isActive: 1 });
ConsentRecordSchema.index({ contactEmail: 1, consentType: 1 });
ConsentRecordSchema.index({ givenAt: -1 });

module.exports = mongoose.model('ConsentRecord', ConsentRecordSchema);
