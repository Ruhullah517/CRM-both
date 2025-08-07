const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  logoFile: String, // File path to uploaded logo image
  logoFileName: String, // Original filename for display
  primaryColor: String, // Hex or color name for template branding
  fontFamily: String, // Font family for template text
  category: String, // e.g., 'follow-up', 'newsletter', 'invite', etc.
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema); 