const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllTrainingEvents,
  getTrainingEventById,
  createTrainingEvent,
  updateTrainingEvent,
  deleteTrainingEvent,
  createBooking,
  updateBookingStatus,
  bulkImportParticipants,
  getBookingsByEvent,
  getPublicBookingLink,
  getAllCertificates,
  downloadCertificate,
  resendCertificateEmail,
  upload
} = require('../controllers/trainingController');

// Public routes (no authentication required)
router.get('/public/:bookingLink', getPublicBookingLink);
router.post('/public/bookings', createBooking);

// Protected routes (require authentication)
router.use(authenticate);

// Training Events
router.get('/events', getAllTrainingEvents);
router.get('/events/:id', getTrainingEventById);
router.post('/events', createTrainingEvent);
router.put('/events/:id', updateTrainingEvent);
router.delete('/events/:id', deleteTrainingEvent);

// Training Bookings
router.get('/events/:eventId/bookings', getBookingsByEvent);

// Certificates
router.get('/certificates', getAllCertificates);

// Training Bookings
router.post('/bookings', createBooking);
router.put('/bookings/:id', updateBookingStatus);
router.post('/bookings/bulk-import', bulkImportParticipants);

// Certificate routes
router.get('/certificates/:id/download', downloadCertificate);
router.post('/certificates/:id/resend-email', resendCertificateEmail);

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
