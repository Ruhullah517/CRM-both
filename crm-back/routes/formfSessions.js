const express = require('express');
const router = express.Router();
const { getSessionsByEnquiryId, upsertSessions } = require('../controllers/formfSessionController');

// Get all sessions for an enquiry
router.get('/:enquiryId', getSessionsByEnquiryId);

// Upsert (create/update) sessions for an enquiry
router.post('/:enquiryId', upsertSessions);

module.exports = router; 