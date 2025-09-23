const express = require('express');
const router = express.Router();
const { createAssessment, getAssessmentByEnquiryId } = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new assessment
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createAssessment);

// Get assessment by enquiry ID
router.get('/:enquiryId', authenticate, authorize('admin', 'manager', 'staff'), getAssessmentByEnquiryId);

module.exports = router; 