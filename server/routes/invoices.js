const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  deleteInvoice,
  generateInvoicePDF,
  getInvoiceStats,
  createInvoiceFromCase
} = require('../controllers/invoiceController');

// All routes require authentication
router.use(auth);

// Invoice CRUD operations
router.get('/', getAllInvoices);
router.get('/stats', getInvoiceStats);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

// Invoice actions
router.put('/:id/mark-paid', markInvoiceAsPaid);
router.get('/:id/pdf', generateInvoicePDF);

// Case-based invoicing
router.post('/case/:caseId', createInvoiceFromCase);

module.exports = router;
