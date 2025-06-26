const express = require('express');
const router = express.Router();
const {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require('../controllers/emailTemplateController');

router.get('/', getAllEmailTemplates);
router.get('/:id', getEmailTemplateById);
router.post('/', createEmailTemplate);
router.put('/:id', updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

module.exports = router; 