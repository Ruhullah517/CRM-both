const mongoose = require('mongoose');

const GeneratedContractSchema = new mongoose.Schema({
  name: { type: String },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractTemplate', required: true },
  roleType: { type: String, enum: ['company', 'freelancer', 'mentor', 'delivery'], required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filledData: { type: Object, required: true }, // key-value mapping of placeholders
  generatedDocUrl: { type: String }, // path to generated PDF
  signedDocUrl: { type: String }, // path to signed PDF (after signature)
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'delivered', 'signed', 'completed', 'declined', 'cancelled', 'expired'], 
    default: 'draft' 
  },
  externalProvider: { type: String, enum: ['adobe', 'docusign', null], default: null },
  externalAgreementId: { type: String }, // DocuSign envelope ID
  externalEnvelopeId: { type: String }, // DocuSign envelope ID (alias)
  recipientEmail: { type: String }, // Email of person who needs to sign
  recipientName: { type: String }, // Name of person who needs to sign
  sentAt: { type: Date }, // When contract was sent for signature
  signedAt: { type: Date }, // When contract was signed
  expiresAt: { type: Date }, // When signature request expires
  docusignStatus: { type: String }, // DocuSign envelope status
  docusignEvents: [{ // Track DocuSign events
    event: { type: String },
    timestamp: { type: Date },
    data: { type: Object }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GeneratedContract', GeneratedContractSchema); 