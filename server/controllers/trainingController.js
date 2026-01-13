const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');
const Certificate = require('../models/Certificate');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const { generateInvoicePDFFile } = require('./invoiceController');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { sendMail, getFromAddress } = require('../utils/mailer');
const { getLogoAttachment } = require('../utils/logoAttachment');
const {
  getEmailContainer,
  getBookingConfirmationContent,
  getInvoiceEmailContent,
  getFeedbackRequestContent,
  getCertificateEmailContent,
  getBookingInvitationContent
} = require('../utils/emailTemplates');

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

// Ensure logo attachments do not crash email sends in production
const buildLogoAttachments = (extra = []) => {
  const logo = getLogoAttachment('company-logo');
  return logo ? [logo, ...extra] : extra;
};

// Helper function to auto-create work history entry for freelancer trainer
const createWorkHistoryForTrainer = async (trainerId, trainingEvent) => {
  try {
    // Get the trainer user
    const trainerUser = await User.findById(trainerId);
    if (!trainerUser || !trainerUser.freelancerId) {
      console.log(`Trainer ${trainerId} is not a freelancer, skipping work history creation`);
      return;
    }

    // Get the freelancer profile
    const freelancer = await Freelancer.findById(trainerUser.freelancerId);
    if (!freelancer) {
      console.log(`Freelancer profile not found for trainer ${trainerId}`);
      return;
    }

    // Calculate hours from event duration
    const startDate = new Date(trainingEvent.startDate);
    const endDate = new Date(trainingEvent.endDate);
    const durationHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60)); // Convert milliseconds to hours

    // Use freelancer's hourly rate, or default to 0
    const hourlyRate = freelancer.hourlyRate || 0;
    const totalAmount = durationHours * hourlyRate;

    // Check if work history entry already exists for this training
    const existingEntry = freelancer.workHistory?.find(
      entry => entry.assignment === `Training: ${trainingEvent.title}` && 
               entry.startDate?.getTime() === startDate.getTime()
    );

    if (existingEntry) {
      console.log(`Work history already exists for this training event`);
      return;
    }

    // Create work history entry
    const workEntry = {
      assignment: `Training: ${trainingEvent.title}`,
      startDate: startDate,
      endDate: endDate,
      hours: durationHours,
      rate: hourlyRate,
      totalAmount: totalAmount,
      status: 'in_progress',
      notes: `Auto-created for training event at ${trainingEvent.location || 'Virtual'}`
    };

    // Add to freelancer's work history
    await Freelancer.findByIdAndUpdate(
      freelancer._id,
      { 
        $push: { workHistory: workEntry },
        updated_at: new Date()
      }
    );

    console.log(`✅ Work history created for trainer ${freelancer.fullName}: ${durationHours}h @ £${hourlyRate}/h = £${totalAmount}`);
  } catch (error) {
    console.error('Error creating work history for trainer:', error);
    // Don't throw error - work history creation should not break the main flow
  }
};

// Helper function to update work history when training event is updated
const updateWorkHistoryForTrainer = async (oldTrainerId, newTrainerId, oldEvent, newEvent) => {
  try {
    // If trainer changed, remove old work history and create new
    if (oldTrainerId && newTrainerId && oldTrainerId.toString() !== newTrainerId.toString()) {
      // Remove old trainer's work history
      const oldTrainerUser = await User.findById(oldTrainerId);
      if (oldTrainerUser?.freelancerId) {
        await Freelancer.findByIdAndUpdate(
          oldTrainerUser.freelancerId,
          {
            $pull: {
              workHistory: {
                assignment: `Training: ${oldEvent.title}`,
                startDate: oldEvent.startDate
              }
            },
            updated_at: new Date()
          }
        );
        console.log(`✅ Removed work history for previous trainer`);
      }

      // Create new trainer's work history
      if (newTrainerId) {
        await createWorkHistoryForTrainer(newTrainerId, newEvent);
      }
    } else if (newTrainerId) {
      // Same trainer, update existing work history if dates or title changed
      const trainerUser = await User.findById(newTrainerId);
      if (trainerUser?.freelancerId) {
        const freelancer = await Freelancer.findById(trainerUser.freelancerId);
        if (freelancer) {
          const startDate = new Date(newEvent.startDate);
          const endDate = new Date(newEvent.endDate);
          const durationHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
          const hourlyRate = freelancer.hourlyRate || 0;
          const totalAmount = durationHours * hourlyRate;

          // Find and update the work history entry
          const workHistoryIndex = freelancer.workHistory.findIndex(
            entry => entry.assignment === `Training: ${oldEvent.title}` &&
                     entry.startDate?.getTime() === new Date(oldEvent.startDate).getTime()
          );

          if (workHistoryIndex !== -1) {
            freelancer.workHistory[workHistoryIndex] = {
              ...freelancer.workHistory[workHistoryIndex].toObject(),
              assignment: `Training: ${newEvent.title}`,
              startDate: startDate,
              endDate: endDate,
              hours: durationHours,
              rate: hourlyRate,
              totalAmount: totalAmount,
              notes: `Updated: Training event at ${newEvent.location || 'Virtual'}`
            };
            await freelancer.save();
            console.log(`✅ Updated work history for trainer`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating work history for trainer:', error);
  }
};

// Get all training events
const getAllTrainingEvents = async (req, res) => {
  try {
    const events = await TrainingEvent.find()
      .populate('trainer', 'name email avatar')
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
      .populate('trainer', 'name email avatar')
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

    // Auto-create work history for freelancer trainer
    if (trainer) {
      await createWorkHistoryForTrainer(trainer, trainingEvent);
    }

    res.status(201).json(trainingEvent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update training event
const updateTrainingEvent = async (req, res) => {
  try {
    // Get the old event data first
    const oldEvent = await TrainingEvent.findById(req.params.id);
    if (!oldEvent) {
      return res.status(404).json({ msg: 'Training event not found' });
    }

    const event = await TrainingEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );

    // Update work history if trainer or event details changed
    const oldTrainerId = oldEvent.trainer?.toString();
    const newTrainerId = event.trainer?.toString();
    
    if (oldTrainerId || newTrainerId) {
      await updateWorkHistoryForTrainer(oldTrainerId, newTrainerId, oldEvent, event);
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

    // Remove work history for trainer if they're a freelancer
    if (event.trainer) {
      const trainerUser = await User.findById(event.trainer);
      if (trainerUser?.freelancerId) {
        await Freelancer.findByIdAndUpdate(
          trainerUser.freelancerId,
          {
            $pull: {
              workHistory: {
                assignment: `Training: ${event.title}`,
                startDate: event.startDate
              }
            },
            updated_at: new Date()
          }
        );
        console.log(`✅ Removed work history for deleted training event`);
      }
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

    // Remove work history for trainer if they're a freelancer
    if (event.trainer) {
      const trainerUser = await User.findById(event.trainer);
      if (trainerUser?.freelancerId) {
        await Freelancer.findByIdAndUpdate(
          trainerUser.freelancerId,
          {
            $pull: {
              workHistory: {
                assignment: `Training: ${event.title}`,
                startDate: event.startDate
              }
            },
            updated_at: new Date()
          }
        );
        console.log(`✅ Removed work history for force-deleted training event`);
      }
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
      console.log('Creating invoice for training with price:', trainingEvent.price);
      try {
        // Generate unique invoice number with timestamp to avoid duplicates
        const timestamp = Date.now();
        const year = new Date().getFullYear();
        const invoiceNumber = `INV-${year}-${timestamp}`;

        console.log('Generated invoice number:', invoiceNumber);

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
          issuedDate: new Date(), // Set the issue date explicitly
          relatedTrainingEvent: trainingEventId,
          createdBy: req.user?.id || trainingEvent.createdBy
        });

        console.log('Invoice object created, saving...');
        await invoice.save();
        console.log('Invoice saved successfully:', invoice._id);

        // Link invoice to booking
        booking.payment.invoiceId = invoice._id;
        await booking.save();
        console.log('Invoice linked to booking successfully');

        // Send invoice via email immediately after registration
        console.log('Sending invoice email to:', participant.email);
        try {
          await sendInvoiceEmail(invoice);
          console.log('Invoice email sent successfully for registration:', invoice.invoiceNumber);
        } catch (emailError) {
          console.error('Error sending invoice email during registration:', emailError);
          // Don't fail the booking if email fails
        }
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        // Don't fail the booking if invoice creation fails
      }
    } else {
      console.log('Training is free, no invoice needed');
    }

    // Note: Confirmation email will be sent when status changes from 'registered' to 'confirmed'
    console.log('Booking created successfully. Confirmation email will be sent when status is changed to confirmed.');

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update booking status (attendance, completion)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, attendance, completion, payment } = req.body;

    const booking = await TrainingBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    const updateData = { updated_at: new Date() };

    if (status) updateData.status = status;
    if (attendance) updateData.attendance = { ...booking.attendance, ...attendance };
    if (completion) updateData.completion = { ...booking.completion, ...completion };
    if (payment) updateData.payment = { ...booking.payment, ...payment };

    const updatedBooking = await TrainingBooking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('trainingEvent');

    // Send confirmation email when status changes from 'registered' to 'confirmed'
    if (status && status === 'confirmed' && booking.status === 'registered') {
      try {
        await sendBookingConfirmationEmail(updatedBooking, updatedBooking.trainingEvent);
        console.log('Confirmation email sent for booking:', updatedBooking._id);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the update if email fails
      }

      // On registration completion (confirmed), ensure invoice exists and is emailed
      try {
        const trainingEvent = updatedBooking.trainingEvent || (await TrainingEvent.findById(updatedBooking.trainingEvent));
        if (trainingEvent && trainingEvent.price > 0) {
          let invoiceId = updatedBooking.payment?.invoiceId;
          let invoiceDoc = invoiceId ? await Invoice.findById(invoiceId) : null;

          // Generate invoice if missing
          if (!invoiceDoc) {
            if (typeof generateInvoiceForBooking === 'function') {
              invoiceDoc = await generateInvoiceForBooking(updatedBooking, trainingEvent);
              updatedBooking.payment = {
                ...(updatedBooking.payment || {}),
                invoiceId: invoiceDoc?._id
              };
              await updatedBooking.save();
            }
          }

          // Send invoice email if not sent before
          if (invoiceDoc) {
            const alreadySent = invoiceDoc.status && invoiceDoc.status !== 'draft';
            if (!alreadySent) {
              try {
                await sendInvoiceEmail(invoiceDoc);
                console.log('Invoice email sent on confirmation for booking:', updatedBooking._id);
              } catch (invoiceEmailErr) {
                console.error('Error sending invoice email on confirmation:', invoiceEmailErr);
              }
            }
          }
        }
      } catch (confirmationInvoiceErr) {
        console.error('Confirmation invoice check failed:', confirmationInvoiceErr);
      }
    }

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

    // On completion, ensure invoice exists and has been emailed to booking maker
    if (completion && completion.completed) {
      try {
        const trainingEvent = updatedBooking.trainingEvent || (await TrainingEvent.findById(updatedBooking.trainingEvent));
        if (trainingEvent && trainingEvent.price > 0) {
          let invoiceId = updatedBooking.payment?.invoiceId;
          let invoiceDoc = invoiceId ? await Invoice.findById(invoiceId) : null;

          // Generate invoice if missing
          if (!invoiceDoc) {
            if (typeof generateInvoiceForBooking === 'function') {
              invoiceDoc = await generateInvoiceForBooking(updatedBooking, trainingEvent);
              // persist link to booking
              updatedBooking.payment = {
                ...(updatedBooking.payment || {}),
                invoiceId: invoiceDoc?._id
              };
              await updatedBooking.save();
            }
          }

          // Send invoice email if not sent before
          if (invoiceDoc) {
            const alreadySent = invoiceDoc.status && invoiceDoc.status !== 'draft';
            if (!alreadySent) {
              try {
                await sendInvoiceEmail(invoiceDoc);
                console.log('Invoice email sent on completion for booking:', updatedBooking._id);
              } catch (invoiceEmailErr) {
                console.error('Error sending invoice email on completion:', invoiceEmailErr);
              }
            }
          }
        }
      } catch (completionInvoiceErr) {
        console.error('Completion invoice check failed:', completionInvoiceErr);
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

    // Helper to safely extract fields from various CSV header formats
    const getField = (participant, keys, fuzzyPatterns = []) => {
      // Exact key matches first (keys are already lowercased on the client)
      for (const key of keys) {
        if (participant[key] !== undefined && participant[key] !== null && String(participant[key]).trim() !== '') {
          return String(participant[key]).trim();
        }
      }

      // Fuzzy match: look for any key that contains one of the patterns
      if (fuzzyPatterns.length) {
        const lowerKeys = Object.keys(participant);
        for (const k of lowerKeys) {
          const lk = k.toLowerCase();
          if (fuzzyPatterns.some(p => lk.includes(p))) {
            const value = participant[k];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
              return String(value).trim();
            }
          }
        }
      }

      return '';
    };
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
            // Support multiple possible CSV header names (all lowercased on the client)
            name: getField(participant, ['name', 'participant name', 'full name'], ['name']),
            email: getField(participant, ['email', 'participant email', 'email address'], ['email']),
            phone: getField(
              participant,
              ['phone', 'telephone', 'mobile', 'phone number', 'contact number'],
              ['phone', 'mobile', 'tel']
            ),
            organization: getField(
              participant,
              ['organization', 'organisation', 'company', 'employer', 'organisation name'],
              ['org', 'company', 'employer']
            ),
            role: getField(participant, ['role', 'position', 'job title'], ['role', 'position', 'title'])
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

        // Generate invoice at registration time if training has a price and no invoice exists
        if (!booking.payment.invoiceId && trainingEvent.price > 0) {
          try {
            const invoice = await generateInvoiceForBooking(booking, trainingEvent);
            // Send invoice via email immediately
            await sendInvoiceEmail(invoice);
            console.log('Invoice sent for', participant.name, 'during bulk import');
          } catch (invoiceError) {
            console.error('Error generating/sending invoice for', participant.name, ':', invoiceError);
            // Don't fail the import if invoice generation fails
          }
        }

        // Note: Confirmation emails will be sent when status is changed to 'confirmed'

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
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ruhullah517@gmail.com',
    //     pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
    //   }
    // });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com",  // Hostinger SMTP server
    //   port: 587,                   // TLS port
    //   secure: false,               // Use TLS
    //   auth: {
    //     user: "hello@blackfostercarersalliance.co.uk", // Your Hostinger email
    //     pass: process.env.HOSTINGER_EMAIL_PASSWORD || "IYght8061" // Use environment variable
    //   },
    //   tls: {
    //     ciphers: "SSLv3"
    //   }
    // });

    // Email content with branded template
    const mailOptions = {
      from: getFromAddress(),
      to: booking.participant.email,
      subject: `Training Registration Confirmed - ${trainingEvent.title}`,
      html: getEmailContainer(getBookingConfirmationContent(booking, trainingEvent)),
      attachments: buildLogoAttachments()
    };

    await sendMail(mailOptions);
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
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ruhullah517@gmail.com',
    //     pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
    //   }
    // });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com",  // Hostinger SMTP server
    //   port: 587,                   // TLS port
    //   secure: false,               // Use TLS
    //   auth: {
    //     user: "hello@blackfostercarersalliance.co.uk", // Your Hostinger email
    //     pass: process.env.HOSTINGER_EMAIL_PASSWORD || "IYght8061" // Use environment variable
    //   },
    //   tls: {
    //     ciphers: "SSLv3"
    //   }
    // });

    // Generate invoice PDF if not already generated
    let pdfPath;
    if (invoice.invoiceUrl) {
      pdfPath = path.join(__dirname, '..', invoice.invoiceUrl.replace('/uploads/', 'uploads/'));
      // Check if file exists, if not regenerate it
      if (!fs.existsSync(pdfPath)) {
        console.log('Invoice PDF not found, regenerating...');
        const pdfUrl = await generateInvoicePDFFile(invoice);
        invoice.invoiceUrl = pdfUrl;
        await invoice.save();
        pdfPath = path.join(__dirname, '..', pdfUrl.replace('/uploads/', 'uploads/'));
        console.log('Invoice PDF regenerated at:', pdfPath);
      }
    } else {
      // Generate PDF if not exists
      const pdfUrl = await generateInvoicePDFFile(invoice);
      pdfPath = path.join(__dirname, '..', pdfUrl.replace('/uploads/', 'uploads/'));
    }

    // Email content with branded template
    const mailOptions = {
      from: getFromAddress(),
      to: invoice.client.email,
      subject: `Invoice for Training Registration - ${invoice.invoiceNumber}`,
      html: getEmailContainer(getInvoiceEmailContent(invoice)),
      attachments: buildLogoAttachments([
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          path: pdfPath
        }
      ])
    };

    await sendMail(mailOptions);
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
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ruhullah517@gmail.com',
    //     pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
    //   }
    // });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com",  // Hostinger SMTP server
    //   port: 587,                   // TLS port
    //   secure: false,               // Use TLS
    //   auth: {
    //     user: "hello@blackfostercarersalliance.co.uk", // Your Hostinger email
    //     pass: process.env.HOSTINGER_EMAIL_PASSWORD || "IYght8061" // Use environment variable
    //   },
    //   tls: {
    //     ciphers: "SSLv3"
    //   }
    // });
    
    // Check if certificate PDF exists, if not regenerate it
    let pdfPath = path.join(__dirname, '..', certificate.certificateUrl.replace('/uploads/', 'uploads/'));
    
    if (!fs.existsSync(pdfPath)) {
      console.log('Certificate PDF not found, regenerating...');
      // Regenerate the certificate PDF
      const newPdfUrl = await generateCertificatePDF(certificate);
      certificate.certificateUrl = newPdfUrl;
      await certificate.save();
      pdfPath = path.join(__dirname, '..', newPdfUrl.replace('/uploads/', 'uploads/'));
      console.log('Certificate PDF regenerated at:', pdfPath);
    }

    // Note: Invoices are now sent at registration time, not with certificates
    const booking = await TrainingBooking.findById(certificate.trainingBooking);
    let invoiceInfo = '';

    if (booking && booking.payment.invoiceId) {
      try {
        const invoice = await Invoice.findById(booking.payment.invoiceId);
        if (invoice) {
          invoiceInfo = `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #2EAB2C; margin-top: 0;">Payment Information</h4>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> £${invoice.total}</p>
              <p>Your invoice was sent to you at the time of registration.</p>
            </div>
          `;
        }
      } catch (invoiceError) {
        console.error('Error processing invoice info for certificate email:', invoiceError);
        // Continue with certificate email even if invoice processing fails
      }
    }

    // Email content with branded template
    const mailOptions = {
      from: getFromAddress(),
      to: certificate.participant.email,
      subject: `Certificate of Completion - ${certificate.courseTitle}`,
      html: getEmailContainer(getCertificateEmailContent(certificate, invoiceInfo)),
      attachments: buildLogoAttachments([
        {
          filename: `certificate-${certificate.certificateNumber}.pdf`,
          path: pdfPath
        }
      ])
    };

    await sendMail(mailOptions);
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

// Generate certificate PDF with new Cultural Practice Power & Progress design
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

      // Create PDF document with custom dimensions matching template (1280x904)
      const doc = new PDFDocument({
        size: [1280, 904], // Custom size matching template dimensions
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Load and add the certificate template as background image
      try {
        // Try different possible locations for the certificate template
        const templatePaths = [
          path.join(__dirname, '../uploads/certificate-template.jpg'),
          path.join(__dirname, '../../client/public/certificate template.jpg'),
          path.join(__dirname, '../uploads/certificate-template.png'),
          path.join(__dirname, '../../client/public/certificate template.png'),
          path.join(__dirname, '../uploads/certificate.jpg'),
          path.join(__dirname, '../../client/public/certificate.jpg')
        ];

        let templateFound = false;
        for (const templatePath of templatePaths) {
          if (fs.existsSync(templatePath)) {
            console.log('Certificate template found at:', templatePath);
            
            // Add the template image as background (full page - 1280x904)
            doc.image(templatePath, 0, 0, { 
              width: 1280, 
              height: 904,
              fit: [1280, 904]
            });
            
            templateFound = true;
            break;
          }
        }

        if (!templateFound) {
          console.log('Certificate template not found, using white background');
          // Fallback to white background if template not found
          doc.rect(0, 0, 1280, 904)
            .fill('#ffffff');
        }
      } catch (error) {
        console.log('Error loading certificate template:', error.message);
        // Fallback to white background
        doc.rect(0, 0, 1280, 904)
          .fill('#ffffff');
      }

      // Get training event title from certificate
      const eventTitle = certificate.trainingEvent ? certificate.trainingEvent.title : 'Training Event';

      // Add participant name ON the black line in the middle
      doc.fontSize(48); // Increased from 32 to 48 for bigger text
      doc.font('Helvetica-Bold');
      doc.fillColor('#000000');
      doc.strokeColor('#000000');
      doc.lineWidth(1); // Added stroke for bolder appearance
      doc.text(certificate.participant.name, 0, 500, { // Position on the black line
        align: 'center',
        width: 1280,
        stroke: true, // Added stroke for bolder text
        fill: true
      });

      // Add description BELOW the black line
      doc.fontSize(18);
      doc.font('Helvetica-Bold');
      doc.fillColor('#000000');
      doc.text(eventTitle.toUpperCase(), 0, 600, { // Position below the black line
        align: 'center',
        width: 1280
      });

      // Add date in bottom right corner (where date should go in template)
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      });
      
      doc.fontSize(16);
      doc.font('Helvetica');
      doc.fillColor('#000000');
      doc.text(formattedDate, 1280 - 150, 904 - 40, { // Position in bottom right corner
        align: 'right',
        width: 140
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
      issuedDate: new Date(), // Set the issue date explicitly
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

    // Note: Invoices are now generated and sent at registration time, not during certificate generation
    if (trainingEvent.price > 0 && !booking.payment.invoiceId) {
      console.log('Certificate generated - invoice should have been sent at registration time');
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

    console.log('Looking for training event with booking link:', bookingLink);

    const trainingEvent = await TrainingEvent.findOne({
      bookingLink,
      status: { $in: ['draft', 'published'] }
    }).populate('trainer', 'name');

    console.log('Found training event:', trainingEvent ? {
      id: trainingEvent._id,
      title: trainingEvent.title,
      status: trainingEvent.status,
      bookingLink: trainingEvent.bookingLink
    } : 'Not found');

    if (!trainingEvent) {
      return res.status(404).json({ msg: 'Training event not found or not available' });
    }

    // Get booking count
    const bookingCount = await TrainingBooking.countDocuments({
      trainingEvent: trainingEvent._id,
      status: { $nin: ['cancelled'] }
    });

    console.log('Available spots:', trainingEvent.maxParticipants - bookingCount);

    res.json({
      event: trainingEvent,
      availableSpots: trainingEvent.maxParticipants - bookingCount
    });
  } catch (error) {
    console.error('Error in getPublicBookingLink:', error);
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

    let pdfPath = path.join(__dirname, '..', certificate.certificateUrl.replace('/uploads/', 'uploads/'));

    if (!fs.existsSync(pdfPath)) {
      console.log('Certificate PDF not found, regenerating...');
      // Regenerate the certificate PDF
      const newPdfUrl = await generateCertificatePDF(certificate);
      certificate.certificateUrl = newPdfUrl;
      await certificate.save();
      pdfPath = path.join(__dirname, '..', newPdfUrl.replace('/uploads/', 'uploads/'));
      console.log('Certificate PDF regenerated at:', pdfPath);
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

// Generate missing invoices for training bookings and send them via email
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
          const invoice = await generateInvoiceForBooking(booking, booking.trainingEvent);
          // Send invoice via email
          await sendInvoiceEmail(invoice);
          results.push({
            success: true,
            participant: booking.participant.name,
            invoiceNumber: invoice.invoiceNumber,
            emailSent: true
          });
        } else {
          results.push({ success: false, participant: booking.participant.name, error: 'Training event is free' });
        }
      } catch (error) {
        results.push({ success: false, participant: booking.participant.name, error: error.message });
      }
    }

    res.json({
      message: `Generated and sent ${results.filter(r => r.success).length} invoices`,
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
    const { getFrontendUrl } = require('../config/urls');
    const { eventId, email, message } = req.body;

    console.log('Request body:', { eventId, email, message: message ? 'provided' : 'not provided' });

    const trainingEvent = await TrainingEvent.findById(eventId);
    if (!trainingEvent) {
      console.log('Training event not found for ID:', eventId);
      return res.status(404).json({ msg: 'Training event not found' });
    }

    console.log('Found training event:', trainingEvent.title);

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ruhullah517@gmail.com',
    //     pass: 'vrcf pvht mrxd rnmq',
    //   }
    // });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.office365.com", // Microsoft 365 SMTP
    //   port: 587,                  // TLS
    //   secure: false,
    //   auth: {
    //     user: "hello@blackfostercarersalliance.co.uk",
    //     pass: "IYght8061" // Or App Password if MFA is enabled
    //   },
    //   tls: {
    //     ciphers: "SSLv3"
    //   }
    // });

    const rawFrontendUrl = getFrontendUrl();
    // Ensure no trailing slash to avoid double slashes in generated links
    const frontendUrl = rawFrontendUrl.replace(/\/+$/, '');
    const bookingUrl = `${frontendUrl}/training/${trainingEvent.bookingLink}`;
    console.log('Environment variables check:');
    console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Using frontend URL:', frontendUrl);
    console.log('Generated booking URL:', bookingUrl);

    const mailOptions = {
      from: getFromAddress(),
      to: email,
      subject: `Training Event Invitation - ${trainingEvent.title}`,
      html: getEmailContainer(getBookingInvitationContent(trainingEvent, bookingUrl, message)),
      text: `Training Event Invitation - ${trainingEvent.title}

You're invited to join our upcoming training session!

${message ? `Personal Message:\n${message}\n\n` : ''}Event Details:
- Title: ${trainingEvent.title}
- Date: ${new Date(trainingEvent.startDate).toLocaleDateString()} - ${new Date(trainingEvent.endDate).toLocaleDateString()}
- Time: ${new Date(trainingEvent.startDate).toLocaleTimeString()} - ${new Date(trainingEvent.endDate).toLocaleTimeString()}
- Location: ${trainingEvent.location || 'To be confirmed'}
- Price: ${trainingEvent.price > 0 ? `£${trainingEvent.price} ${trainingEvent.currency}` : 'Free'}

Book Now:
${bookingUrl}

We look forward to seeing you at the training!

Best regards,
Black Foster Carers Alliance Training Team

---
Contact Us:
Email: Enquiries@blackfostercarersalliance.co.uk
Phone: 0800 001 6230
Website: www.blackfostercarersalliance.co.uk`,
      attachments: buildLogoAttachments()
    };

    console.log('Sending email to:', email);
    await sendMail(mailOptions);
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

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ruhullah517@gmail.com',
    //     pass: 'vrcf pvht mrxd rnmq',
    //   }
    // });

    // const transporter = nodemailer.createTransport({
    //   host: "smtp.hostinger.com",  // Hostinger SMTP server
    //   port: 587,                   // TLS port
    //   secure: false,               // Use TLS
    //   auth: {
    //     user: "hello@blackfostercarersalliance.co.uk", // Your Hostinger email
    //     pass: process.env.HOSTINGER_EMAIL_PASSWORD || "IYght8061" // Use environment variable
    //   },
    //   tls: {
    //     ciphers: "SSLv3"
    //   }
    // });

    const { getFrontendUrl } = require('../config/urls');
    const frontendUrl = getFrontendUrl();
    const feedbackUrl = `${frontendUrl}/feedback/${bookingId}`;

    const mailOptions = {
      from: getFromAddress(),
      to: booking.participant.email,
      subject: `Feedback Request - ${booking.trainingEvent.title}`,
      html: getEmailContainer(getFeedbackRequestContent(booking)),
      attachments: buildLogoAttachments()
    };

    await sendMail(mailOptions);
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
