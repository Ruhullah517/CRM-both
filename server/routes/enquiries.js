const express = require('express');
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  approveEnquiry,
  rejectEnquiry,
  assignEnquiry,
} = require('../controllers/enquiryController');

// List all enquiries
router.get('/', getAllEnquiries);

// Get a single enquiry by ID
router.get('/:id', getEnquiryById);

// Approve an enquiry
router.post('/:id/approve', approveEnquiry);

// Reject an enquiry
router.post('/:id/reject', rejectEnquiry);

// Assign an enquiry to a staff member
router.post('/:id/assign', assignEnquiry);

router.post('/', createEnquiry);

module.exports = router; 