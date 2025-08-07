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
} = require('../controllers/emailTemplateController');
const { sendBulkEmail } = require('../controllers/emailController');
const upload = require('../middleware/upload');

router.get('/', getAllEmailTemplates);
router.get('/:id', getEmailTemplateById);
router.post('/', upload.single('logo'), createEmailTemplate);
router.put('/:id', upload.single('logo'), updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

// Debug endpoint to check template data
router.get('/debug/templates', debugTemplates);

// Test endpoint to verify logo data
router.get('/test/logo/:templateId', testTemplateLogo);

// Migration endpoint to convert existing templates to base64
router.post('/migrate-to-base64', migrateTemplatesToBase64);

// Bulk email endpoint
router.post('/bulk', sendBulkEmail);

module.exports = router; 