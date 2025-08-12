const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange
} = require('../controllers/calendarController');

// All routes require authentication
router.use(auth);

// Calendar Events CRUD operations
router.get('/', getAllEvents);
router.get('/range', getEventsByDateRange);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
