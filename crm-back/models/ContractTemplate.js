const mongoose = require('mongoose');

const ContractTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  body: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContractTemplate', ContractTemplateSchema); 