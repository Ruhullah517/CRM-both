const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackByEvent,
  updateIssueStatus,
  getFeedbackStats
} = require('../controllers/feedbackController');

// Public route for submitting feedback (no authentication required)
router.post('/submit', submitFeedback);

// Protected routes (require authentication)
router.use(authenticate);

// Get all feedback for admin review
router.get('/', getAllFeedback);

// Get feedback for a specific training event
router.get('/event/:eventId', getFeedbackByEvent);

// Update issue status
router.put('/issues/status', updateIssueStatus);

// Get feedback statistics
router.get('/stats', getFeedbackStats);

module.exports = router;
