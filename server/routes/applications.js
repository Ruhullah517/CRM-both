const express = require('express');
const router = express.Router();
const { uploadApplication, getApplicationByEnquiryId } = require('../controllers/applicationController');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

// Upload application form
router.post('/upload', authenticate, authorize('admin', 'manager', 'staff'), upload.single('applicationForm'), uploadApplication);

// Get application by enquiry ID
router.get('/:enquiryId', authenticate, authorize('admin', 'manager', 'staff'), getApplicationByEnquiryId);

module.exports = router; 