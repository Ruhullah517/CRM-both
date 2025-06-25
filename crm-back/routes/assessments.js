const express = require('express');
const router = express.Router();
const { createAssessment, getAssessmentByEnquiryId } = require('../controllers/assessmentController');

// Create a new assessment
router.post('/', createAssessment);

// Get assessment by enquiry ID
router.get('/:enquiryId', getAssessmentByEnquiryId);

module.exports = router; 