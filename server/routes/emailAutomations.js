const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getAutomationLogs,
  testAutomation
} = require('../controllers/emailAutomationController');

// All routes require authentication
router.use(authenticate);

// Get all automations
router.get('/', authorize('admin', 'manager'), getAllAutomations);

// Get automation by ID
router.get('/:id', authorize('admin', 'manager'), getAutomationById);

// Create new automation
router.post('/', authorize('admin', 'manager'), createAutomation);

// Update automation
router.put('/:id', authorize('admin', 'manager'), updateAutomation);

// Delete automation
router.delete('/:id', authorize('admin', 'manager'), deleteAutomation);

// Toggle automation active status
router.patch('/:id/toggle', authorize('admin', 'manager'), toggleAutomation);

// Get automation logs
router.get('/:id/logs', authorize('admin', 'manager'), getAutomationLogs);

// Test automation
router.post('/:id/test', authorize('admin', 'manager'), testAutomation);

module.exports = router;
