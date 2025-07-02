const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractTemplate' },
  name: String,
  role: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  start_date: Date,
  end_date: Date,
  status: { type: String, default: 'Draft' },
  signed: { type: Boolean, default: false },
  file_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema); 