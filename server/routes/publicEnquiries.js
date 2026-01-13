const express = require('express');
const router = express.Router();

// Public endpoint for WordPress/website enquiries (no auth)
const { createEnquiry } = require('../controllers/enquiryController');

// POST /public/enquiries
router.post('/', createEnquiry);

module.exports = router;

