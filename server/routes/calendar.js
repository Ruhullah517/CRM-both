const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange
} = require('../controllers/calendarController');

// All routes require authentication
router.use(authenticate);

// Calendar Events CRUD operations
router.get('/', authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), getAllEvents);
router.get('/range', authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), getEventsByDateRange);
router.get('/:id', authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), getEventById);
router.post('/', authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), createEvent);
router.put('/:id', authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), updateEvent);
router.delete('/:id', authorize('admin', 'manager', 'staff', 'caseworker'), deleteEvent);

module.exports = router;
