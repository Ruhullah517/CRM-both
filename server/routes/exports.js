const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  exportTrainingEvents,
  exportTrainingBookings,
  exportPaymentHistory,
  exportContacts,
  exportEnquiries
} = require('../controllers/exportController');

// All export routes require authentication
router.use(authenticate);

// Export training events
router.get('/training-events', exportTrainingEvents);

// Export training bookings (can filter by eventId)
router.get('/training-bookings', exportTrainingBookings);

// Export payment history
router.get('/payment-history', exportPaymentHistory);

// Export contacts
router.get('/contacts', exportContacts);

// Export enquiries
router.get('/enquiries', exportEnquiries);

module.exports = router;
