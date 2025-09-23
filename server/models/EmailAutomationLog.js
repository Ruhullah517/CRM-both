const mongoose = require('mongoose');

const EmailAutomationLogSchema = new mongoose.Schema({
  automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailAutomation', required: true },
  triggerType: { type: String, required: true },
  triggerEntityType: { type: String, required: true }, // 'contact', 'enquiry', 'case', etc.
  triggerEntityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientEmail: { type: String, required: true },
  recipientName: String,
  emailSubject: String,
  emailStatus: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
    default: 'pending'
  },
  scheduledFor: { type: Date, required: true },
  sentAt: Date,
  errorMessage: String,
  emailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Email' }, // Link to actual sent email
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailAutomationLog', EmailAutomationLogSchema);
