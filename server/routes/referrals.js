const express = require('express');
const router = express.Router();
const { createCaseFromReferral } = require('../controllers/caseReferralController');

// Public endpoint for website referrals
router.post('/', createCaseFromReferral);

module.exports = router; 