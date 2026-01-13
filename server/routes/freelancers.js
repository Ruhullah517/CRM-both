const express = require('express');
const router = express.Router();
const {
  getAllFreelancers,
  getFreelancerById,
  getFreelancerByEmail,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
  sendFreelancerFormLink,
  submitFreelancerPublicForm,
  updateAvailability,
  updateMyAvailability,
  addComplianceDocument,
  deleteComplianceDocument,
  addWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  getExpiringCompliance,
  updateContractRenewal,
  createUserAccountForFreelancer,
} = require('../controllers/freelancerController');
const freelancerUploads = require('../middleware/freelancerUploads');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'manager', 'staff', 'caseworker'), getAllFreelancers);
router.get('/compliance/expiring', authenticate, authorize('admin', 'manager', 'staff'), getExpiringCompliance);
router.get('/email/:email', authenticate, getFreelancerByEmail);  // Must come before /:id
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getFreelancerById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, createFreelancer);
// Public endpoint: send form link to a freelancer's email (no auth required)
router.post('/send-form-link', sendFreelancerFormLink);
router.post('/public', freelancerUploads, submitFreelancerPublicForm);
router.put('/my-availability', authenticate, updateMyAvailability);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, updateFreelancer);
router.put('/:id/availability', authenticate, authorize('admin', 'manager', 'staff'), updateAvailability);
router.put('/:id/contract-renewal', authenticate, authorize('admin', 'manager', 'staff'), updateContractRenewal);
router.post('/:id/compliance-documents', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, addComplianceDocument);
router.delete('/:id/compliance-documents/:documentIndex', authenticate, authorize('admin', 'manager', 'staff'), deleteComplianceDocument);
router.post('/:id/work-history', authenticate, authorize('admin', 'manager', 'staff'), addWorkHistory);
router.put('/:id/work-history/:workIndex', authenticate, authorize('admin', 'manager', 'staff'), updateWorkHistory);
router.delete('/:id/work-history/:workIndex', authenticate, authorize('admin', 'manager', 'staff'), deleteWorkHistory);
router.post('/:id/create-user-account', authenticate, authorize('admin', 'manager', 'staff'), createUserAccountForFreelancer);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteFreelancer);

module.exports = router; 