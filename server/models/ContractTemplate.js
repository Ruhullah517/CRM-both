const mongoose = require('mongoose');

const ContractTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['company', 'freelancer', 'mentor', 'delivery'], required: true },
  content: { type: String, required: true }, // Template body with placeholders
  placeholders: [String], // Optional: for UI generation
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ContractTemplate', ContractTemplateSchema); 