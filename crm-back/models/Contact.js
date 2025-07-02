const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  type: { type: String, default: 'personal' },
  tags: [String],
  notes: String,
  emailHistory: [String],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema); 