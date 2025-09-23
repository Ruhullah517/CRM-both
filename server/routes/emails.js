const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  sendBulkEmail,
  sendIndividualEmail,
  sendEmailToContactsByTags,
  getEmailHistory,
  getEmailStats,
  previewEmail
} = require('../controllers/emailController');

// All routes require authentication
router.use(authenticate);

// Email sending routes
router.post('/bulk', authorize('admin', 'manager', 'staff'), sendBulkEmail);
router.post('/individual', authorize('admin', 'manager', 'staff'), sendIndividualEmail);
router.post('/contacts-by-tags', authorize('admin', 'manager', 'staff'), sendEmailToContactsByTags);

// Email management routes
router.get('/history', authorize('admin', 'manager', 'staff'), getEmailHistory);
router.get('/stats', authorize('admin', 'manager', 'staff'), getEmailStats);
router.post('/preview', authorize('admin', 'manager', 'staff'), previewEmail);

module.exports = router;
