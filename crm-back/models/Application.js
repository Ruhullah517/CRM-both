const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  application_form_path: String,
  status: { type: String, default: 'Pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema); 