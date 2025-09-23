const express = require('express');
const router = express.Router();
const { createCaseFromReferral } = require('../controllers/caseReferralController');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoint for website referrals stays public
router.post('/', createCaseFromReferral);

module.exports = router; 