const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  // user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  name: { type: String, required: true },
  email: String,
  phone: String,
  role: { type: String },
  documents: [String], // URLs to generated contracts, PDFs, etc.
  type: { type: String, default: 'personal' },
  tags: [String],
  notes: String,
  emailHistory: [String],
  organizationName: String,
  organizationAddress: String,
  
  // Enhanced contact management fields
  contactType: { 
    type: String, 
    enum: ['partner', 'customer', 'prospect', 'freelancer', 'trainer', 'mentor', 'other'],
    default: 'prospect'
  },
  interestAreas: [String], // e.g., ['training', 'mentoring', 'membership']
  leadSource: String, // e.g., 'website', 'referral', 'event', 'social_media'
  leadScore: { type: Number, default: 0 }, // 0-100 lead scoring
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  lastContactDate: Date,
  nextFollowUpDate: Date,
  
  // Structured communication history (e.g., emails, calls, meetings)
  communicationHistory: [
    {
      type: { type: String }, // e.g., 'email', 'call', 'meeting'
      date: Date,
      summary: String,
      engagement: {
        opened: Boolean,
        clicked: Boolean,
        bounced: Boolean,
      }
    }
  ],
  
  // Email preferences
  emailPreferences: {
    marketing: { type: Boolean, default: true },
    training: { type: Boolean, default: true },
    newsletters: { type: Boolean, default: true },
    updates: { type: Boolean, default: true }
  },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
ContactSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Contact', ContactSchema); 