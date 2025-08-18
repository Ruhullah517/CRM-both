const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');
const { generateInvoicePDFFile } = require('./invoiceController');
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

// Get single booking by ID (for public feedback)
const getBookingById = async (req, res) => {
  try {
    const booking = await TrainingBooking.findById(req.params.id)
      .populate('trainingEvent', 'title startDate endDate');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json(booking);
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

// Force delete training event with all bookings
const forceDeleteTrainingEvent = async (req, res) => {
  try {
    const event = await TrainingEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    // Delete all related bookings first
    await TrainingBooking.deleteMany({ trainingEvent: req.params.id });
    
    // Delete all related certificates
    await Certificate.deleteMany({ trainingEvent: req.params.id });
    
    // Delete all related invoices
    await Invoice.deleteMany({ 'items.relatedId': req.params.id });
    
    // Delete all related feedback
    await Feedback.deleteMany({ trainingEvent: req.params.id });

    // Finally delete the training event
    await TrainingEvent.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Training event and all related data deleted successfully' });
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
        // Generate unique invoice number with timestamp to avoid duplicates
        const timestamp = Date.now();
        const year = new Date().getFullYear();
        const invoiceNumber = `INV-${year}-${timestamp}`;

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
      
      // Send feedback request email when training is completed
      try {
        await sendFeedbackRequestEmail(updatedBooking._id);
      } catch (feedbackEmailError) {
        console.error('Error sending feedback request email:', feedbackEmailError);
        // Don't fail the update if feedback email fails
      }
    }

    // Auto-generate invoice when marked as completed
    if (completion && completion.completed) {
      console.log('Training marked as completed, checking for invoice generation...');
      try {
        const trainingEvent = await TrainingEvent.findById(booking.trainingEvent);
        console.log('Training event price:', trainingEvent?.price);
        console.log('Updated booking invoice ID:', updatedBooking.payment.invoiceId);
        
        // Only generate invoice if it doesn't already exist and training has a price
        if (trainingEvent && trainingEvent.price > 0 && !updatedBooking.payment.invoiceId) {
          console.log('Generating invoice for completed training...');
          await generateInvoiceForBooking(updatedBooking, trainingEvent);
          console.log('Invoice generated successfully');
        } else {
          console.log('Invoice generation skipped - conditions not met');
          if (updatedBooking.payment.invoiceId) {
            console.log('Invoice already exists for this booking');
          }
          if (!trainingEvent?.price || trainingEvent.price <= 0) {
            console.log('Training event is free or has no price');
          }
        }
      } catch (invoiceError) {
        console.error('Error creating invoice during completion:', invoiceError);
        // Don't fail the update if invoice creation fails
      }
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

        // Generate invoice if the participant completed the training and no invoice exists
        if (convertToBoolean(participant.completed) && !booking.payment.invoiceId && trainingEvent.price > 0) {
          try {
            await generateInvoiceForBooking(booking, trainingEvent);
          } catch (invoiceError) {
            console.error('Error generating invoice for', participant.name, ':', invoiceError);
            // Don't fail the import if invoice generation fails
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

// Send invoice via email
const sendInvoiceEmail = async (invoice) => {
  try {
    console.log('Starting to send invoice email for invoice:', invoice.invoiceNumber);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
      }
    });

    // Generate invoice PDF if not already generated
    let pdfPath;
    if (invoice.invoiceUrl) {
      pdfPath = path.join(__dirname, '..', invoice.invoiceUrl.replace('/uploads/', 'uploads/'));
    } else {
      // Generate PDF if not exists
      const pdfUrl = await generateInvoicePDFFile(invoice);
      pdfPath = path.join(__dirname, '..', pdfUrl.replace('/uploads/', 'uploads/'));
    }

    // Email content
    const mailOptions = {
      from: 'ruhullah517@gmail.com',
      to: invoice.client.email,
      subject: `Invoice for Training - ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Training Invoice</h2>
          <p>Dear ${invoice.client.name},</p>
          <p>Please find attached the invoice for your training completion.</p>
          <h3 style="color: #212529;">Invoice Details:</h3>
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Issue Date:</strong> ${invoice.issueDate.toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> £${invoice.total}</p>
          <p>Please review the attached invoice and process the payment by the due date.</p>
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>CRM Training Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully to:', invoice.client.email);

    // Update invoice status
    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};

// Send certificate via email
const sendCertificateEmail = async (certificate) => {
  try {
    console.log('Starting to send certificate email for certificate:', certificate.certificateNumber);
    
    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
      }
    });

    const pdfPath = path.join(__dirname, '..', certificate.certificateUrl.replace('/uploads/', 'uploads/'));

    // Check if there's an associated invoice to include
    const booking = await TrainingBooking.findById(certificate.trainingBooking);
    let invoiceAttachment = null;
    let invoiceInfo = '';
    
    if (booking && booking.payment.invoiceId) {
      try {
        const invoice = await Invoice.findById(booking.payment.invoiceId);
        if (invoice) {
          // Generate invoice PDF if not already generated
          let invoicePdfPath;
          if (invoice.invoiceUrl) {
            invoicePdfPath = path.join(__dirname, '..', invoice.invoiceUrl.replace('/uploads/', 'uploads/'));
          } else {
            const invoicePdfUrl = await generateInvoicePDFFile(invoice);
            invoicePdfPath = path.join(__dirname, '..', invoicePdfUrl.replace('/uploads/', 'uploads/'));
          }
          
          invoiceAttachment = {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            path: invoicePdfPath
          };
          
          invoiceInfo = `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #dc3545; margin-top: 0;">Invoice Information</h4>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Amount Due:</strong> £${invoice.total}</p>
              <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
              <p>Your invoice is also attached to this email for your records.</p>
            </div>
          `;
        }
      } catch (invoiceError) {
        console.error('Error processing invoice for certificate email:', invoiceError);
        // Continue with certificate email even if invoice processing fails
      }
    }

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
          ${invoiceInfo}
          <p>Thank you for participating in our training program!</p>
          <br>
          <p>Best regards,<br>CRM Training Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `certificate-${certificate.certificateNumber}.pdf`,
          path: pdfPath
        },
        ...(invoiceAttachment ? [invoiceAttachment] : [])
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log('Certificate email sent successfully to:', certificate.participant.email);

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

// Generate invoice for a booking
const generateInvoiceForBooking = async (booking, trainingEvent) => {
  try {
    console.log('Starting invoice generation for booking:', booking._id);
    console.log('Training event:', trainingEvent.title, 'Price:', trainingEvent.price);
    
    // Generate unique invoice number with timestamp to avoid duplicates
    const timestamp = Date.now();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${timestamp}`;
    
    console.log('Generated invoice number:', invoiceNumber);

    const invoice = new Invoice({
      invoiceNumber,
      client: {
        name: booking.participant.name,
        email: booking.participant.email,
        phone: booking.participant.phone,
        organization: booking.participant.organization
      },
      items: [{
        description: trainingEvent.title,
        quantity: 1,
        unitPrice: trainingEvent.price,
        total: trainingEvent.price,
        type: 'training',
        relatedId: trainingEvent._id
      }],
      subtotal: trainingEvent.price,
      total: trainingEvent.price,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      relatedTrainingEvent: trainingEvent._id,
      createdBy: trainingEvent.createdBy
    });

    console.log('Invoice object created, saving...');
    await invoice.save();
    console.log('Invoice saved successfully:', invoice._id);

    // Link invoice to booking
    booking.payment.invoiceId = invoice._id;
    await booking.save();
    console.log('Invoice linked to booking successfully');

    return invoice;
  } catch (error) {
    console.error('Error generating invoice for booking:', error);
    throw error;
  }
};

// Generate certificate
const generateCertificate = async (booking) => {
  try {
    const trainingEvent = await TrainingEvent.findById(booking.trainingEvent);

    // Generate certificate number manually to ensure it's set
    const count = await Certificate.countDocuments();
    const year = new Date().getFullYear();
    const certificateNumber = `CERT-${year}-${String(count + 1).padStart(4, '0')}`;

    const certificate = new Certificate({
      certificateNumber,
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

    // Create invoice if not already exists and training has a price
    if (trainingEvent.price > 0 && !booking.payment.invoiceId) {
      console.log('Certificate generated, now generating invoice...');
      try {
        await generateInvoiceForBooking(booking, trainingEvent);
        console.log('Invoice generated successfully during certificate generation');
      } catch (invoiceError) {
        console.error('Error creating invoice during certificate generation:', invoiceError);
        // Don't fail the certificate generation if invoice creation fails
      }
    } else {
      console.log('Invoice generation skipped during certificate generation - conditions not met');
      if (booking.payment.invoiceId) {
        console.log('Invoice already exists for this booking during certificate generation');
      }
      if (!trainingEvent.price || trainingEvent.price <= 0) {
        console.log('Training event is free or has no price during certificate generation');
      }
    }

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

// Generate missing invoices for training bookings
const generateMissingInvoices = async (req, res) => {
  try {
    const { trainingEventId } = req.params;
    
    // Find all bookings without invoices for paid training events
    const bookingsWithoutInvoices = await TrainingBooking.find({
      trainingEvent: trainingEventId,
      'payment.invoiceId': { $exists: false }
    }).populate('trainingEvent');

    const results = [];
    for (const booking of bookingsWithoutInvoices) {
      try {
        if (booking.trainingEvent.price > 0) {
          await generateInvoiceForBooking(booking, booking.trainingEvent);
          results.push({ success: true, participant: booking.participant.name, invoiceNumber: booking.payment.invoiceId });
        } else {
          results.push({ success: false, participant: booking.participant.name, error: 'Training event is free' });
        }
      } catch (error) {
        results.push({ success: false, participant: booking.participant.name, error: error.message });
      }
    }

    res.json({ 
      message: `Generated ${results.filter(r => r.success).length} invoices`,
      results 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Send booking link via email
const sendBookingLinkEmail = async (req, res) => {
  try {
    console.log('Sending booking link email...');
    const { eventId, email, message } = req.body;
    
    console.log('Request body:', { eventId, email, message: message ? 'provided' : 'not provided' });

    const trainingEvent = await TrainingEvent.findById(eventId);
    if (!trainingEvent) {
      console.log('Training event not found for ID:', eventId);
      return res.status(404).json({ msg: 'Training event not found' });
    }

    console.log('Found training event:', trainingEvent.title);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq',
      }
    });

    const bookingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/training/${trainingEvent.bookingLink}`;
    console.log('Booking URL:', bookingUrl);
    
    const mailOptions = {
      from: "ruhullah517@gmail.com",
      to: email,
      subject: `Training Event Invitation - ${trainingEvent.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2EAB2C;">Training Event Invitation</h2>
          <p>${message ? message.replace(/\n/g, '<br>') : ''}</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details:</h3>
            <p><strong>Title:</strong> ${trainingEvent.title}</p>
            <p><strong>Date:</strong> ${new Date(trainingEvent.startDate).toLocaleDateString()} - ${new Date(trainingEvent.endDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${trainingEvent.location || 'TBD'}</p>
            <p><strong>Price:</strong> £${trainingEvent.price} ${trainingEvent.currency}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${bookingUrl}" style="background-color: #2EAB2C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Book Now
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${bookingUrl}">${bookingUrl}</a>
          </p>
        </div>
      `
    };

    console.log('Sending email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.json({ msg: 'Booking link sent successfully' });
  } catch (error) {
    console.error('Error sending booking link email:', error);
    res.status(500).json({ msg: 'Error sending email', error: error.message });
  }
};

// Resend invoice email
const resendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ msg: 'Invoice not found' });
    }

    await sendInvoiceEmail(invoice);
    res.json({ msg: 'Invoice email sent successfully' });
  } catch (error) {
    console.error('Error resending invoice email:', error);
    res.status(500).json({ msg: 'Error sending invoice email', error: error.message });
  }
};

// Send feedback request email
const sendFeedbackRequestEmail = async (bookingId) => {
  try {
    const booking = await TrainingBooking.findById(bookingId)
      .populate('trainingEvent', 'title startDate endDate');
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq',
      }
    });

    const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/feedback/${bookingId}`;
    
    const mailOptions = {
      from: "ruhullah517@gmail.com",
      to: booking.participant.email,
      subject: `Feedback Request - ${booking.trainingEvent.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2EAB2C;">Training Feedback Request</h2>
          <p>Dear ${booking.participant.name},</p>
          <p>Thank you for completing our training event: <strong>${booking.trainingEvent.title}</strong></p>
          <p>We would greatly appreciate your feedback to help us improve our training programs.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Training Details:</h3>
            <p><strong>Event:</strong> ${booking.trainingEvent.title}</p>
            <p><strong>Date:</strong> ${new Date(booking.trainingEvent.startDate).toLocaleDateString()} - ${new Date(booking.trainingEvent.endDate).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${feedbackUrl}" style="background-color: #2EAB2C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Provide Feedback
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${feedbackUrl}">${feedbackUrl}</a>
          </p>
          
          <p>Your feedback is valuable to us and will help us enhance our training programs.</p>
          <p>Best regards,<br>Training Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending feedback request email:', error);
    return false;
  }
};

module.exports = {
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
  sendBookingConfirmationEmail,
  generateMissingCertificates,
  generateMissingInvoices,
  generateInvoiceForBooking,
  sendBookingLinkEmail,
  sendFeedbackRequestEmail,
  upload
};
