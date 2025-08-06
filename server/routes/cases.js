const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  uploadCaseFile, 
  assignCaseworkers
} = require('../controllers/caseController');
const upload = require('../middleware/upload');
const activityController = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/auth');

// List all cases (admin, manager)
router.get('/', authenticate, getAllCases);
// Get a single case (admin, manager, caseworker, volunteer)
router.get('/:id', authenticate, authorize('admin', 'manager', 'caseworker', 'volunteer'), getCaseById);
// Create a case (admin, manager, caseworker)
router.post('/', authenticate, authorize('admin', 'manager', 'caseworker'), createCase);
// Upload file (admin, manager, caseworker)
router.post('/upload', authenticate, authorize('admin', 'manager', 'caseworker'), upload.single('file'), uploadCaseFile);
// Assign caseworkers (admin, manager)
router.post('/assign-caseworkers', authenticate, authorize('admin', 'manager'), assignCaseworkers);
// Log activity (admin, manager, caseworker)
router.post('/:id/activities', authenticate, authorize('admin', 'manager', 'caseworker'), activityController.logActivity);
// Get activities (all roles)
router.get('/:id/activities', authenticate, authorize('admin', 'manager', 'caseworker', 'volunteer'), activityController.getActivitiesByCase);
// Update a case (admin, manager, caseworker)
router.put('/:id', authenticate, authorize('admin', 'manager', 'caseworker'), updateCase);
// Delete a case (admin, manager)
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteCase);

module.exports = router; 