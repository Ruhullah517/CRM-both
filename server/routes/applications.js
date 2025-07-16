const express = require('express');
const router = express.Router();
const { uploadApplication, getApplicationByEnquiryId } = require('../controllers/applicationController');
const upload = require('../middleware/upload');

// Upload application form
router.post('/upload', upload.single('applicationForm'), uploadApplication);

// Get application by enquiry ID
router.get('/:enquiryId', getApplicationByEnquiryId);

module.exports = router; 