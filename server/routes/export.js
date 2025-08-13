const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  exportTrainingEvents,
  exportParticipants,
  exportPaymentHistory,
  exportCertificates,
  exportFeedback
} = require('../controllers/exportController');

// All export routes require authentication
router.use(authenticate);

// Export training events
router.get('/training-events', exportTrainingEvents);

// Export participants (can filter by event)
router.get('/participants', exportParticipants);

// Export payment history
router.get('/payment-history', exportPaymentHistory);

// Export certificates
router.get('/certificates', exportCertificates);

// Export feedback
router.get('/feedback', exportFeedback);

module.exports = router;
