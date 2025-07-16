const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// Reports endpoints
router.get('/cases-status', authenticate, authorize('admin', 'manager'), reportController.casesStatusReport); // Open/Closed by date
router.get('/case-type-distribution', authenticate, authorize('admin', 'manager'), reportController.caseTypeDistribution);
router.get('/outcome-analysis', authenticate, authorize('admin', 'manager'), reportController.outcomeAnalysis);
router.get('/caseload-by-worker', authenticate, authorize('admin', 'manager'), reportController.caseloadByWorker);
router.get('/time-to-resolution', authenticate, authorize('admin', 'manager'), reportController.timeToResolution);
router.get('/demographics', authenticate, authorize('admin', 'manager'), reportController.demographicBreakdown);
router.get('/time-logged', authenticate, authorize('admin', 'manager'), reportController.timeLoggedReport);
router.get('/invoiceable-hours', authenticate, authorize('admin', 'manager'), reportController.invoiceableHoursReport);

// Export endpoints (CSV/PDF)
router.get('/export/:type', authenticate, authorize('admin', 'manager'), reportController.exportReport);

module.exports = router; 