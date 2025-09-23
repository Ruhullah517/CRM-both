const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createReminder, listReminders, completeReminder } = require('../controllers/reminderController');

router.use(authenticate, authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'));

router.post('/', createReminder);
router.get('/', listReminders);
router.put('/:id/complete', completeReminder);

module.exports = router;


