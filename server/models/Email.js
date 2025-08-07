const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // Email address
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }, // Optional reference
  subject: { type: String, required: true },
  body: { type: String, required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate' },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  error: { type: String },
  sentAt: { type: Date },
  engagement: {
    opened: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    bounced: { type: Boolean, default: false },
  },
  meta: { type: Object }, // For any extra info (e.g., campaign, tags)
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', EmailSchema);