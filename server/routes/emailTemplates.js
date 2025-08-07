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
const upload = require('../middleware/upload');

router.get('/', getAllEmailTemplates);
router.get('/:id', getEmailTemplateById);
router.post('/', upload.single('logo'), createEmailTemplate);
router.put('/:id', upload.single('logo'), updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

// Bulk email endpoint
router.post('/bulk', sendBulkEmail);

module.exports = router; 