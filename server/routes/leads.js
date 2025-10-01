const express = require('express');
const router = express.Router();
const {
  captureContactFormLead,
  captureSubscriberLead,
  captureTrainingInterestLead,
  captureMentoringInterestLead
} = require('../controllers/leadController');

// Public routes - no authentication required
// These are meant to be called from your website contact forms

// General contact form submission
router.post('/contact-form', captureContactFormLead);

// Newsletter/email subscription
router.post('/subscribe', captureSubscriberLead);

// Training interest form
router.post('/training-interest', captureTrainingInterestLead);

// Mentoring interest form
router.post('/mentoring-interest', captureMentoringInterestLead);

module.exports = router;

