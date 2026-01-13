const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllTrainingEvents,
  getTrainingEventById,
  getBookingById,
  createTrainingEvent,
  updateTrainingEvent,
  deleteTrainingEvent,
  forceDeleteTrainingEvent,
  createBooking,
  updateBookingStatus,
  bulkImportParticipants,
  getBookingsByEvent,
  getPublicBookingLink,
  getAllCertificates,
  downloadCertificate,
  resendCertificateEmail,
  sendInvoiceEmail,
  resendInvoiceEmail,
  generateMissingCertificates,
  generateMissingInvoices,
  sendBookingLinkEmail,
  upload
} = require('../controllers/trainingController');

// Public routes (no authentication required)
router.get('/public/:bookingLink', getPublicBookingLink);
router.post('/public/bookings', createBooking);
router.get('/bookings/:id', getBookingById);

// Protected routes (require authentication)
router.use(authenticate);

// Training Events
router.get('/events', authorize('admin', 'manager', 'staff', 'trainer', 'caseworker'), getAllTrainingEvents);
router.get('/events/:id', authorize('admin', 'manager', 'staff', 'trainer'), getTrainingEventById);
router.post('/events', authorize('admin', 'manager', 'staff'), createTrainingEvent);
router.put('/events/:id', authorize('admin', 'manager', 'staff'), updateTrainingEvent);
router.delete('/events/:id', authorize('admin', 'manager'), deleteTrainingEvent);
router.delete('/events/:id/force', authorize('admin'), forceDeleteTrainingEvent);

// Training Bookings
router.get('/events/:eventId/bookings', authorize('admin', 'manager', 'staff', 'trainer'), getBookingsByEvent);

// Certificates
router.get('/certificates', authorize('admin', 'manager', 'staff', 'trainer'), getAllCertificates);

// Training Bookings
router.post('/bookings', authorize('admin', 'manager', 'staff'), createBooking);
router.put('/bookings/:id', authorize('admin', 'manager', 'staff'), updateBookingStatus);
router.post('/bookings/bulk-import', authorize('admin', 'manager', 'staff'), bulkImportParticipants);

// Certificate routes
router.get('/certificates/:id/download', authorize('admin', 'manager', 'staff', 'trainer'), downloadCertificate);
router.post('/certificates/:id/resend-email', authorize('admin', 'manager', 'staff'), resendCertificateEmail);
router.post('/events/:trainingEventId/generate-certificates', authorize('admin', 'manager', 'staff'), generateMissingCertificates);
router.post('/events/:trainingEventId/generate-invoices', authorize('admin', 'manager', 'staff'), generateMissingInvoices);

// Invoice routes
router.post('/invoices/:id/resend-email', authorize('admin', 'manager', 'staff'), resendInvoiceEmail);

// Email routes
router.post('/send-booking-link', authorize('admin', 'manager', 'staff'), sendBookingLinkEmail);

// File upload for training materials
router.post('/events/:id/materials', upload.single('material'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    const materialUrl = `/uploads/training-materials/${req.file.filename}`;
    res.json({ 
      url: materialUrl, 
      filename: req.file.originalname,
      type: req.file.mimetype 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
