const express = require('express');
const router = express.Router();
const { createFreelancer } = require('../controllers/freelancerController');
const freelancerUploads = require('../middleware/freelancerUploads');

// Public freelancer form submission
router.post('/', freelancerUploads, createFreelancer);

module.exports = router;
