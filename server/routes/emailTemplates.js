const express = require('express');
const router = express.Router();
const {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  migrateTemplatesToBase64,
  debugTemplates,
  testTemplateLogo,
  serveLogo,
  serveLogoByTemplate,
} = require('../controllers/emailTemplateController');
const { sendBulkEmail } = require('../controllers/emailController');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllEmailTemplates);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getEmailTemplateById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), upload.single('logo'), createEmailTemplate);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), upload.single('logo'), updateEmailTemplate);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteEmailTemplate);

// Debug endpoint to check template data
router.get('/debug/templates', authenticate, authorize('admin'), debugTemplates);

// Test endpoint to verify logo data
router.get('/test/logo/:templateId', authenticate, authorize('admin', 'manager', 'staff'), testTemplateLogo);

// Serve logo images for email templates
router.get('/logo/:encodedLogo', serveLogo);

// Serve logo images for email templates by template ID
router.get('/logo/template/:templateId', serveLogoByTemplate);

// Migration endpoint to convert existing templates to base64
router.post('/migrate-to-base64', authenticate, authorize('admin'), migrateTemplatesToBase64);

// Bulk email endpoint
router.post('/bulk', authenticate, authorize('admin', 'manager', 'staff'), sendBulkEmail);

module.exports = router; 