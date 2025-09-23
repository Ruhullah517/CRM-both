const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  approveEnquiry,
  rejectEnquiry,
  assignEnquiry,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const { authenticate, authorize } = require('../middleware/auth');

// List all enquiries
router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllEnquiries);

// Get a single enquiry by ID
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getEnquiryById);

// Approve an enquiry
router.post('/:id/approve', authenticate, authorize('admin', 'manager', 'staff'), approveEnquiry);

// Reject an enquiry
router.post('/:id/reject', authenticate, authorize('admin', 'manager', 'staff'), rejectEnquiry);

// Assign an enquiry to a staff member
router.post('/:id/assign', authenticate, authorize('admin', 'manager', 'staff'), assignEnquiry);

router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createEnquiry);

router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteEnquiry);

module.exports = router; 