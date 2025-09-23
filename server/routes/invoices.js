const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  generateInvoicePDF,
  getInvoiceStats,
  createInvoiceFromCase,
  createInvoiceFromTrainingBooking,
  autoCreateInvoicesForPaidTraining,
  getOverdueInvoices,
  sendInvoice
} = require('../controllers/invoiceController');

// All routes require authentication
router.use(authenticate);

// Invoice CRUD operations
router.get('/', authorize('admin', 'manager', 'staff'), getAllInvoices);
router.get('/stats', authorize('admin', 'manager', 'staff'), getInvoiceStats);
router.get('/overdue', authorize('admin', 'manager', 'staff'), getOverdueInvoices);
router.get('/:id', authorize('admin', 'manager', 'staff'), getInvoiceById);
router.post('/', authorize('admin', 'manager', 'staff'), createInvoice);
router.put('/:id', authorize('admin', 'manager', 'staff'), updateInvoice);
router.delete('/:id', authorize('admin', 'manager'), deleteInvoice);

// Invoice actions
router.put('/:id/mark-paid', authorize('admin', 'manager', 'staff'), markInvoiceAsPaid);
router.put('/:id/send', authorize('admin', 'manager', 'staff'), sendInvoice);
router.get('/:id/pdf', authorize('admin', 'manager', 'staff'), generateInvoicePDF);

// Case-based invoicing
router.post('/case/:caseId', authorize('admin', 'manager', 'staff'), createInvoiceFromCase);

// Training-based invoicing
router.post('/training-booking/:bookingId', authorize('admin', 'manager', 'staff'), createInvoiceFromTrainingBooking);
router.post('/training-event/:trainingEventId/auto-create', authorize('admin', 'manager', 'staff'), autoCreateInvoicesForPaidTraining);

module.exports = router;
