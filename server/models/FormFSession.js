const mongoose = require('mongoose');

const FormFSessionSchema = new mongoose.Schema({
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', required: true },
  session_number: { type: Number, required: true },
  notes: String,
  date: Date,
  completed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormFSession', FormFSessionSchema); 