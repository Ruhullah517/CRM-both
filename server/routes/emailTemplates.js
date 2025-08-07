const express = require('express');
const router = express.Router();
const {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require('../controllers/emailTemplateController');
const { sendBulkEmail } = require('../controllers/emailController');

router.get('/', getAllEmailTemplates);
router.get('/:id', getEmailTemplateById);
router.post('/', createEmailTemplate);
router.put('/:id', updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

// Bulk email endpoint
router.post('/bulk', sendBulkEmail);

module.exports = router; 