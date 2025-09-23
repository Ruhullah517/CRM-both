const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getContactConsent,
  recordConsent,
  getDataRetentionPolicies,
  setDataRetentionPolicy,
  getAuditLogs,
  exportUserData,
  anonymizeUserData,
  getComplianceReport,
  processDataRetention
} = require('../controllers/gdprController');

// All routes require authentication
router.use(authenticate);

// Consent management
router.get('/consent/:contactId', authorize('admin', 'manager', 'staff'), getContactConsent);
router.post('/consent', authorize('admin', 'manager', 'staff'), recordConsent);

// Data retention policies
router.get('/retention-policies', authorize('admin', 'manager'), getDataRetentionPolicies);
router.post('/retention-policies', authorize('admin'), setDataRetentionPolicy);

// Audit logs
router.get('/audit-logs', authorize('admin', 'manager'), getAuditLogs);

// Data export and anonymization
router.get('/export/:contactId', authorize('admin', 'manager'), exportUserData);
router.post('/anonymize/:contactId', authorize('admin'), anonymizeUserData);

// Compliance reporting
router.get('/compliance-report', authorize('admin', 'manager'), getComplianceReport);
router.post('/process-retention', authorize('admin'), processDataRetention);

module.exports = router;
