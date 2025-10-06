const express = require('express');
const router = express.Router();
const {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
  sendFreelancerFormLink,
  submitFreelancerPublicForm,
  updateAvailability,
  addComplianceDocument,
  addWorkHistory,
  getExpiringCompliance,
  updateContractRenewal,
} = require('../controllers/freelancerController');
const freelancerUploads = require('../middleware/freelancerUploads');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllFreelancers);
router.get('/compliance/expiring', authenticate, authorize('admin', 'manager', 'staff'), getExpiringCompliance);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getFreelancerById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, createFreelancer);
router.post('/send-form-link', authenticate, authorize('admin', 'manager', 'staff'), sendFreelancerFormLink);
router.post('/public', freelancerUploads, submitFreelancerPublicForm);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, updateFreelancer);
router.put('/:id/availability', authenticate, authorize('admin', 'manager', 'staff'), updateAvailability);
router.put('/:id/contract-renewal', authenticate, authorize('admin', 'manager', 'staff'), updateContractRenewal);
router.post('/:id/compliance-documents', authenticate, authorize('admin', 'manager', 'staff'), freelancerUploads, addComplianceDocument);
router.post('/:id/work-history', authenticate, authorize('admin', 'manager', 'staff'), addWorkHistory);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteFreelancer);

module.exports = router; 