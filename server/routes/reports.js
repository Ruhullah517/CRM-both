const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

// Reports endpoints
router.get('/cases-status', authenticate, authorize('admin', 'manager', 'staff'), reportController.casesStatusReport); // Open/Closed by date
router.get('/case-type-distribution', authenticate, authorize('admin', 'manager', 'staff'), reportController.caseTypeDistribution);
router.get('/outcome-analysis', authenticate, authorize('admin', 'manager', 'staff'), reportController.outcomeAnalysis);
router.get('/caseload-by-worker', authenticate, authorize('admin', 'manager', 'staff'), reportController.caseloadByWorker);
router.get('/time-to-resolution', authenticate, authorize('admin', 'manager', 'staff'), reportController.timeToResolution);
router.get('/demographics', authenticate, authorize('admin', 'manager', 'staff'), reportController.demographicBreakdown);
router.get('/time-logged', authenticate, authorize('admin', 'manager', 'staff'), reportController.timeLoggedReport);
router.get('/invoiceable-hours', authenticate, authorize('admin', 'manager', 'staff'), reportController.invoiceableHoursReport);

// New analytics endpoints
router.get('/freelancer-work', authenticate, authorize('admin', 'manager', 'staff'), reportController.freelancerWorkReport);
router.get('/contract-status', authenticate, authorize('admin', 'manager', 'staff'), reportController.contractStatusReport);
router.get('/recruitment-pipeline', authenticate, authorize('admin', 'manager', 'staff'), reportController.recruitmentPipelineReport);
router.get('/invoice-revenue', authenticate, authorize('admin', 'manager', 'staff'), reportController.invoiceRevenueReport);
router.get('/training-events', authenticate, authorize('admin', 'manager', 'staff'), reportController.trainingEventsReport);
router.get('/mentors', authenticate, authorize('admin', 'manager', 'staff'), reportController.mentorReport);

// New CSV exports for analytics tabs
router.get('/export/freelancer-work', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportFreelancerWorkReport);
router.get('/export/recruitment-pipeline', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportRecruitmentPipelineReport);
router.get('/export/invoice-revenue', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportInvoiceRevenueReport);
router.get('/export/training-events-analytics', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportTrainingEventsAnalytics);
router.get('/export/mentors', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportMentorReport);
router.get('/export/cases-analytics', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportCasesTabAnalytics);

// Generic export endpoint (param route must come last)
router.get('/export/:type', authenticate, authorize('admin', 'manager', 'staff'), reportController.exportReport);

module.exports = router; 