const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/training-materials';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all training events
const getAllTrainingEvents = async (req, res) => {
  try {
    const events = await TrainingEvent.find()
      .populate('trainer', 'name email')
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get single training event
const getTrainingEventById = async (req, res) => {
  try {
    const event = await TrainingEvent.findById(req.params.id)
      .populate('trainer', 'name email')
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    // Get bookings for this event
    const bookings = await TrainingBooking.find({ trainingEvent: req.params.id })
      .sort({ created_at: -1 });

    res.json({ event, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create new training event
const createTrainingEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      trainer,
      location,
      virtualMeetingLink,
      startDate,
      endDate,
      maxParticipants,
      price,
      currency,
      tags
    } = req.body;

    // Generate unique booking link
    const bookingLink = `training-${uuidv4().split('-')[0]}`;

    const trainingEvent = new TrainingEvent({
      title,
      description,
      trainer,
      location,
      virtualMeetingLink,
      startDate,
      endDate,
      maxParticipants,
      price,
      currency,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      bookingLink,
      createdBy: req.user.id
    });

    await trainingEvent.save();
    res.status(201).json(trainingEvent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update training event
const updateTrainingEvent = async (req, res) => {
  try {
    const event = await TrainingEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete training event
const deleteTrainingEvent = async (req, res) => {
  try {
    const event = await TrainingEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    // Check if there are any bookings
    const bookings = await TrainingBooking.find({ trainingEvent: req.params.id });
    if (bookings.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete event with existing bookings' });
    }

    await TrainingEvent.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Training event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create booking (admin or public)
const createBooking = async (req, res) => {
  try {
    const {
      trainingEventId,
      participant,
      bookingMethod = 'admin'
    } = req.body;

    // Validate training event
    const trainingEvent = await TrainingEvent.findById(trainingEventId);
    if (!trainingEvent) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    // Check if event is published
    if (trainingEvent.status !== 'published') {
      return res.status(400).json({ msg: 'Training event is not available for booking' });
    }

    // Check capacity
    const existingBookings = await TrainingBooking.countDocuments({
      trainingEvent: trainingEventId,
      status: { $nin: ['cancelled'] }
    });

    if (existingBookings >= trainingEvent.maxParticipants) {
      return res.status(400).json({ msg: 'Training event is full' });
    }

    // Check if participant already booked
    const existingBooking = await TrainingBooking.findOne({
      trainingEvent: trainingEventId,
      'participant.email': participant.email,
      status: { $nin: ['cancelled'] }
    });

    if (existingBooking) {
      return res.status(400).json({ msg: 'Participant already registered for this event' });
    }

    const booking = new TrainingBooking({
      trainingEvent: trainingEventId,
      participant,
      bookingMethod,
      payment: {
        amount: trainingEvent.price,
        currency: trainingEvent.currency
      }
    });

    await booking.save();

    // Create invoice if training is paid
    if (trainingEvent.price > 0) {
      try {
        // Generate invoice number manually to ensure it's set
        const invoiceCount = await Invoice.countDocuments();
        const year = new Date().getFullYear();
        const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

        const invoice = new Invoice({
          invoiceNumber,
          client: {
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            organization: participant.organization
          },
          items: [{
            description: trainingEvent.title,
            quantity: 1,
            unitPrice: trainingEvent.price,
            total: trainingEvent.price,
            type: 'training',
            relatedId: trainingEventId
          }],
          subtotal: trainingEvent.price,
          total: trainingEvent.price,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          relatedTrainingEvent: trainingEventId,
          createdBy: req.user?.id || trainingEvent.createdBy
        });

        await invoice.save();

        // Link invoice to booking
        booking.payment.invoiceId = invoice._id;
        await booking.save();
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        // Don't fail the booking if invoice creation fails
      }
    }

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail(booking, trainingEvent);
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update booking status (attendance, completion)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, attendance, completion } = req.body;

    const booking = await TrainingBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    const updateData = { updated_at: new Date() };

    if (status) updateData.status = status;
    if (attendance) updateData.attendance = { ...booking.attendance, ...attendance };
    if (completion) updateData.completion = { ...booking.completion, ...completion };

    const updatedBooking = await TrainingBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('trainingEvent');

    // Auto-generate certificate when marked as completed
    if (completion && completion.completed && !booking.completion.certificateGenerated) {
      await generateCertificate(updatedBooking);
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Bulk import participants (CSV/Excel)
const bulkImportParticipants = async (req, res) => {
  try {
    const { trainingEventId, participants } = req.body;

    const trainingEvent = await TrainingEvent.findById(trainingEventId);
    if (!trainingEvent) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    const results = [];
    for (const participant of participants) {
      try {
        // Convert string boolean values to actual booleans
        const convertToBoolean = (value) => {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase().trim();
            return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
          }
          return false;
        };

        const booking = new TrainingBooking({
          trainingEvent: trainingEventId,
          participant: {
            name: participant.name,
            email: participant.email,
            phone: participant.phone || '',
            organization: participant.organization || '',
            role: participant.role || ''
          },
          status: participant.status || 'registered',
          bookingMethod: 'admin',
          attendance: {
            attended: convertToBoolean(participant.attended),
            attendanceDate: participant.attendanceDate ? new Date(participant.attendanceDate) : null,
            duration: participant.duration || '',
            notes: participant.notes || ''
          },
          completion: {
            completed: convertToBoolean(participant.completed),
            completionDate: participant.completionDate ? new Date(participant.completionDate) : null
          },
          payment: {
            amount: trainingEvent.price,
            currency: trainingEvent.currency,
            status: participant.paymentStatus || 'pending'
          }
        });

        await booking.save();
        
        // Generate certificate if the participant completed the training
        if (convertToBoolean(participant.completed) && !booking.completion.certificateGenerated) {
          try {
            await generateCertificate(booking);
          } catch (certError) {
            console.error('Error generating certificate for', participant.name, ':', certError);
            // Don't fail the import if certificate generation fails
          }
        }
        
        results.push({ success: true, participant: participant.name });
      } catch (error) {
        results.push({ success: false, participant: participant.name, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, trainingEvent) => {
  try {
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
      }
    });

    // Email content
    const mailOptions = {
      from: "ruhullah517@gmail.com",
      to: booking.participant.email,
      subject: `Booking Confirmation - ${trainingEvent.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Booking Confirmation</h2>
          <p>Dear ${booking.participant.name},</p>
          <p>Thank you for registering for our training event!</p>
          <h3 style="color: #212529;">Event Details</h3>
          <p><strong>Event:</strong> ${trainingEvent.title}</p>
          <p><strong>Date:</strong> ${new Date(trainingEvent.startDate).toLocaleDateString()} - ${new Date(trainingEvent.endDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(trainingEvent.startDate).toLocaleTimeString()} - ${new Date(trainingEvent.endDate).toLocaleTimeString()}</p>
          <p><strong>Location:</strong> ${trainingEvent.location || 'To be confirmed'}</p>
          ${trainingEvent.virtualMeetingLink ? `<p><strong>Virtual Meeting Link:</strong> <a href="${trainingEvent.virtualMeetingLink}">${trainingEvent.virtualMeetingLink}</a></p>` : ''}
          <p><strong>Booking Reference:</strong> ${booking._id}</p>
          ${trainingEvent.price > 0 ? `<p><strong>Amount:</strong> £${trainingEvent.price} ${trainingEvent.currency}</p>` : '<p><strong>Amount:</strong> Free</p>'}
          <p>We will send you a reminder closer to the event date. If you have any questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>CRM Training Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw error;
  }
};

// Send certificate via email
const sendCertificateEmail = async (certificate) => {
  try {
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
      }
    });

    const pdfPath = path.join(__dirname, '..', certificate.certificateUrl.replace('/uploads/', 'uploads/'));

    // Email content
    const mailOptions = {
      from: 'ruhullah517@gmail.com',
      to: certificate.participant.email,
      subject: `Certificate of Completion - ${certificate.courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Certificate of Completion</h2>
          <p>Dear ${certificate.participant.name},</p>
          <p>Congratulations! You have successfully completed the training course:</p>
          <h3 style="color: #212529;">${certificate.courseTitle}</h3>
          <p><strong>Completion Date:</strong> ${certificate.completionDate.toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${certificate.duration}</p>
          <p><strong>Certificate Number:</strong> ${certificate.certificateNumber}</p>
          <p>Your certificate is attached to this email. You can also download it from your training dashboard.</p>
          <p>Thank you for participating in our training program!</p>
          <br>
          <p>Best regards,<br>CRM Training Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `certificate-${certificate.certificateNumber}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // Update certificate status
    certificate.status = 'sent';
    certificate.sentAt = new Date();
    await certificate.save();

    return true;
  } catch (error) {
    console.error('Error sending certificate email:', error);
    throw error;
  }
};

// Generate certificate PDF
const generateCertificatePDF = async (certificate) => {
  return new Promise((resolve, reject) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = 'uploads/certificates';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `certificate-${certificate.certificateNumber}.pdf`;
      const filepath = path.join(uploadDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add background
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fill('#f8f9fa');

      // Add border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .stroke('#007bff');

      // Add inner border
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .stroke('#dee2e6');

      // Add certificate title
      doc.fontSize(36)
        .font('Helvetica-Bold')
        .fill('#007bff')
        .text('Certificate of Completion', 0, 120, {
          align: 'center',
          width: doc.page.width
        });

      // Add decorative line
      doc.moveTo(100, 180)
        .lineTo(doc.page.width - 100, 180)
        .lineWidth(2)
        .stroke('#007bff');

      // Add participant name
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fill('#212529')
        .text('This is to certify that', 0, 220, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fill('#007bff')
        .text(certificate.participant.name, 0, 260, {
          align: 'center',
          width: doc.page.width
        });

      // Add course details
      doc.fontSize(18)
        .font('Helvetica')
        .fill('#6c757d')
        .text('has successfully completed the training course', 0, 310, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fill('#212529')
        .text(certificate.courseTitle, 0, 350, {
          align: 'center',
          width: doc.page.width
        });

      // Add completion details
      doc.fontSize(16)
        .font('Helvetica')
        .fill('#6c757d')
        .text(`Duration: ${certificate.duration}`, 0, 400, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(16)
        .font('Helvetica')
        .fill('#6c757d')
        .text(`Completed on: ${certificate.completionDate.toLocaleDateString()}`, 0, 430, {
          align: 'center',
          width: doc.page.width
        });

      // Add certificate number
      doc.fontSize(12)
        .font('Helvetica')
        .fill('#6c757d')
        .text(`Certificate Number: ${certificate.certificateNumber}`, 0, 480, {
          align: 'center',
          width: doc.page.width
        });

      // Add signature line
      doc.fontSize(14)
        .font('Helvetica')
        .fill('#6c757d')
        .text('Authorized Signature', doc.page.width - 200, 520, {
          align: 'center',
          width: 150
        });

      doc.moveTo(doc.page.width - 200, 540)
        .lineTo(doc.page.width - 50, 540)
        .lineWidth(1)
        .stroke('#6c757d');

      // Add company logo/name area
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fill('#007bff')
        .text('CRM Training System', 50, 520, {
          align: 'center',
          width: 150
        });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        const pdfUrl = `/uploads/certificates/${filename}`;
        resolve(pdfUrl);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Generate certificate
const generateCertificate = async (booking) => {
  try {
    const trainingEvent = await TrainingEvent.findById(booking.trainingEvent);

    const certificate = new Certificate({
      participant: {
        name: booking.participant.name,
        email: booking.participant.email
      },
      trainingEvent: booking.trainingEvent,
      trainingBooking: booking._id,
      courseTitle: trainingEvent.title,
      completionDate: booking.completion.completionDate || new Date(),
      duration: booking.attendance.duration || '2 hours',
      trainer: trainingEvent.trainer,
      createdBy: trainingEvent.createdBy
    });

    await certificate.save();

    // Generate PDF certificate
    const pdfUrl = await generateCertificatePDF(certificate);
    certificate.certificateUrl = pdfUrl;
    await certificate.save();

    // Update booking
    booking.completion.certificateGenerated = true;
    booking.completion.certificateUrl = pdfUrl;
    await booking.save();

    // Send certificate via email
    try {
      await sendCertificateEmail(certificate);
    } catch (emailError) {
      console.error('Failed to send certificate email:', emailError);
      // Don't fail the whole process if email fails
    }

    return certificate;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

// Get bookings for a specific training event
const getBookingsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const bookings = await TrainingBooking.find({ trainingEvent: eventId })
      .populate('trainingEvent', 'title startDate endDate')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get public booking link
const getPublicBookingLink = async (req, res) => {
  try {
    const { bookingLink } = req.params;

    const trainingEvent = await TrainingEvent.findOne({
      bookingLink,
      status: 'published'
    }).populate('trainer', 'name');

    if (!trainingEvent) {
      return res.status(404).json({ msg: 'Training event not found or not available' });
    }

    // Get booking count
    const bookingCount = await TrainingBooking.countDocuments({
      trainingEvent: trainingEvent._id,
      status: { $nin: ['cancelled'] }
    });

    res.json({
      event: trainingEvent,
      availableSpots: trainingEvent.maxParticipants - bookingCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Download certificate
const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found' });
    }

    const pdfPath = path.join(__dirname, '..', certificate.certificateUrl.replace('/uploads/', 'uploads/'));

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ msg: 'Certificate file not found' });
    }

    res.download(pdfPath, `certificate-${certificate.certificateNumber}.pdf`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get all certificates
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('trainingEvent', 'title')
      .populate('trainer', 'name')
      .sort({ created_at: -1 });

    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Generate missing certificates for completed bookings
const generateMissingCertificates = async (req, res) => {
  try {
    const { trainingEventId } = req.params;
    
    // Find all completed bookings without certificates
    const completedBookings = await TrainingBooking.find({
      trainingEvent: trainingEventId,
      'completion.completed': true,
      'completion.certificateGenerated': { $ne: true }
    });

    const results = [];
    for (const booking of completedBookings) {
      try {
        await generateCertificate(booking);
        results.push({ success: true, participant: booking.participant.name });
      } catch (error) {
        results.push({ success: false, participant: booking.participant.name, error: error.message });
      }
    }

    res.json({ 
      message: `Generated ${results.filter(r => r.success).length} certificates`,
      results 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Resend certificate email
const resendCertificateEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ msg: 'Certificate not found' });
    }

    await sendCertificateEmail(certificate);

    res.json({ msg: 'Certificate email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
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
  sendBookingConfirmationEmail,
  generateMissingCertificates,
  upload
};
