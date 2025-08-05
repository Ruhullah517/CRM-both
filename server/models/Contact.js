const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema); 