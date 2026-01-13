const express = require('express');
const router = express.Router();

// Public endpoint for WordPress cultural mentoring / mentee candidates (no auth)
const { createCandidateFromWpForm } = require('../controllers/candidateController');

// POST /public/candidates
router.post('/', createCandidateFromWpForm);

// Temporary debug endpoint to see payload structure (remove after mapping all fields)
// GET /public/candidates/debug - Returns instructions
router.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint for WordPress candidate form',
    instructions: [
      '1. Submit a test form from WordPress to POST /public/candidates',
      '2. Check your server console/logs for detailed payload structure',
      '3. If name is missing, the error response will include the payload structure',
      '4. Look for keys like "fields.field_XXXXXXX.raw_value" in the logs',
      '5. Update wpCandidateFieldMap in candidateController.js with actual field IDs'
    ],
    endpoint: 'POST /public/candidates',
    note: 'All incoming payloads are logged to server console with full structure'
  });
});

module.exports = router;


