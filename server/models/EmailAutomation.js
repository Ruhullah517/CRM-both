const mongoose = require('mongoose');

const EmailAutomationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  triggerType: { 
    type: String, 
    enum: ['contact_created', 'contact_updated', 'enquiry_submitted', 'case_created', 'case_updated', 'training_booking', 'invoice_sent', 'invoice_overdue', 'reminder_due', 'custom'],
    required: true 
  },
  triggerConditions: {
    // Flexible conditions based on trigger type
    field: String, // e.g., 'status', 'contactType', 'pipelineStage'
    operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'] },
    value: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, array
    additionalConditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed,
      logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
    }]
  },
  emailTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
  recipientType: { 
    type: String, 
    enum: ['contact', 'user', 'custom', 'all_contacts', 'contacts_by_tag', 'contacts_by_type'],
    required: true 
  },
  recipientConfig: {
    // Configuration for recipient selection
    contactField: String, // e.g., 'email', 'primaryEmail'
    userRole: String, // e.g., 'admin', 'manager'
    customEmails: [String],
    tagFilters: [String],
    typeFilters: [String]
  },
  delay: {
    type: { type: String, enum: ['immediate', 'minutes', 'hours', 'days', 'weeks'], default: 'immediate' },
    value: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  lastTriggered: Date,
  triggerCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
EmailAutomationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('EmailAutomation', EmailAutomationSchema);
