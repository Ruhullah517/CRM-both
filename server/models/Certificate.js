const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  certificateNumber: { type: String, required: true, unique: true },
  participant: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  trainingEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingEvent', required: true },
  trainingBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingBooking', required: true },
  courseTitle: { type: String, required: true },
  completionDate: { type: Date, required: true },
  duration: String, // e.g., "2.5 hours"
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  certificateUrl: String, // Generated PDF URL
  status: { 
    type: String, 
    enum: ['generated', 'sent', 'downloaded'], 
    default: 'generated' 
  },
  sentAt: Date,
  downloadedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto-generate certificate number
CertificateSchema.pre('validate', async function(next) {
  if (this.isNew && !this.certificateNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.certificateNumber = `CERT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);
