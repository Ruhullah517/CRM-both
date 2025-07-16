const mongoose = require('mongoose');

const CaseworkerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isLead: { type: Boolean, default: false }
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  name: String,
  url: String,
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  caseReferenceNumber: { type: String, unique: true, required: true },
  clientFullName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  ethnicity: { type: String },
  contactInfo: {
    email: String,
    phone: String
  },
  address: String,
  referralSource: String,
  caseType: String,
  presentingIssues: String,
  assignedCaseworkers: [CaseworkerSchema],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  keyDates: {
    opened: Date,
    reviewDue: Date,
    closed: Date
  },
  status: {
    type: String,
    enum: [
      'New',
      'Awaiting Assessment',
      'Active',
      'Paused',
      'Escalated',
      'Closed – Resolved',
      'Closed – Unresolved'
    ],
    default: 'New'
  },
  pausedReason: String,
  notes: String,
  outcomeAchieved: String,
  supportingDocuments: [DocumentSchema],
  totalTimeLogged: { type: String, default: '00:00' }, // hh:mm
  invoiceableHours: { type: String, default: '00:00' }, // hh:mm
  referralDetails: {
    position: String,
    hours: String,
    sswName: String,
    sswContactNumber: String,
    sswEmail: String,
    sswLocalAuthority: String,
    decisionMakerName: String,
    decisionMakerContactNumber: String,
    decisionMakerEmail: String,
    financeContactName: String,
    financeContactNumber: String,
    financeEmail: String
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', CaseSchema); 