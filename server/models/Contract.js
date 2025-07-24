const mongoose = require('mongoose');

const GeneratedContractSchema = new mongoose.Schema({
  name: { type: String },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractTemplate', required: true },
  roleType: { type: String, enum: ['company', 'freelancer', 'mentor', 'delivery'], required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filledData: { type: Object, required: true }, // key-value mapping of placeholders
  generatedDocUrl: { type: String }, // path to generated PDF
  signedDocUrl: { type: String }, // path to signed PDF (after signature)
  status: { type: String, enum: ['pending', 'signed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GeneratedContract', GeneratedContractSchema); 