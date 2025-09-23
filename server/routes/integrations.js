const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { subscribe } = require('../utils/mailchimp');

router.use(authenticate, authorize('admin', 'manager', 'staff'));

// Mailchimp subscribe endpoint
router.post('/mailchimp/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName, tags = [] } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const result = await subscribe(email, { FNAME: firstName || '', LNAME: lastName || '' }, tags);
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


