const express = require('express');
const router = express.Router();
const { createAssessment, getAssessmentByEnquiryId, uploadAttachments, uploadAttachment } = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a new assessment
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createAssessment);

// Get assessment by enquiry ID
router.get('/:enquiryId', authenticate, authorize('admin', 'manager', 'staff'), getAssessmentByEnquiryId);

// Upload assessment attachments
router.post('/upload-attachments', authenticate, authorize('admin', 'manager', 'staff'), uploadAttachments);

// Upload single assessment attachment
router.post('/upload-attachment', authenticate, authorize('admin', 'manager', 'staff'), uploadAttachment);

module.exports = router; 