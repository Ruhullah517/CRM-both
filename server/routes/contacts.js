const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactsByTags,
  getContactsByType,
  getContactsNeedingFollowUp,
  addCommunicationHistory,
  updateLeadScore,
  getContactStats,
  bulkUpdateContacts,
} = require('../controllers/contactController');
const { authenticate, authorize } = require('../middleware/auth');

// Basic CRUD operations
router.get('/', authenticate, authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), getAllContacts);
router.get('/stats', authenticate, authorize('admin', 'manager', 'staff'), getContactStats);
router.get('/by-tags', authenticate, authorize('admin', 'manager', 'staff'), getContactsByTags);
router.get('/by-type/:contactType', authenticate, authorize('admin', 'manager', 'staff'), getContactsByType);
router.get('/follow-up-needed', authenticate, authorize('admin', 'manager', 'staff'), getContactsNeedingFollowUp);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff', 'caseworker', 'trainer'), getContactById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createContact);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), updateContact);
router.put('/:id/lead-score', authenticate, authorize('admin', 'manager', 'staff'), updateLeadScore);
router.put('/bulk-update', authenticate, authorize('admin', 'manager', 'staff'), bulkUpdateContacts);
router.post('/:id/communication', authenticate, authorize('admin', 'manager', 'staff'), addCommunicationHistory);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteContact);

module.exports = router; 