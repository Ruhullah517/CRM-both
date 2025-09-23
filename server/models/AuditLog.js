const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'create', 'read', 'update', 'delete', 'login', 'logout', 'password_change',
      'export', 'import', 'bulk_update', 'bulk_delete', 'email_sent', 'file_upload',
      'file_download', 'permission_change', 'role_change', 'data_export', 'data_import'
    ]
  },
  entityType: { 
    type: String, 
    required: true,
    enum: [
      'user', 'contact', 'enquiry', 'case', 'contract', 'freelancer', 'mentor',
      'training', 'invoice', 'email', 'email_template', 'reminder', 'audit_log'
    ]
  },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  entityName: String, // Human-readable name for the entity
  oldValues: mongoose.Schema.Types.Mixed, // Previous values for updates
  newValues: mongoose.Schema.Types.Mixed, // New values for updates
  ipAddress: { type: String, required: true },
  userAgent: String,
  sessionId: String,
  description: String, // Human-readable description of the action
  riskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low' 
  },
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: String, // If available from IP geolocation
    referrer: String
  },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ riskLevel: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
