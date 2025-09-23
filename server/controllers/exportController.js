const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');
const Invoice = require('../models/Invoice');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const { Parser } = require('json2csv');
const Contact = require('../models/Contact');
const Enquiry = require('../models/Enquiry');

// Export training events data
const exportTrainingEvents = async (req, res) => {
  try {
    const events = await TrainingEvent.find()
      .populate('trainer', 'name email')
      .populate('createdBy', 'name')
      .lean();

    const csvData = events.map(event => ({
      'Event ID': event._id,
      'Title': event.title,
      'Description': event.description,
      'Trainer': event.trainer?.name || 'Not assigned',
      'Trainer Email': event.trainer?.email || '',
      'Location': event.location || '',
      'Virtual Meeting Link': event.virtualMeetingLink || '',
      'Start Date': new Date(event.startDate).toLocaleDateString(),
      'End Date': new Date(event.endDate).toLocaleDateString(),
      'Max Participants': event.maxParticipants,
      'Price': event.price,
      'Currency': event.currency,
      'Status': event.status,
      'Booking Link': event.bookingLink,
      'Tags': event.tags?.join(', ') || '',
      'Created By': event.createdBy?.name || '',
      'Created Date': new Date(event.created_at).toLocaleDateString()
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=training-events.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting training events:', error);
    res.status(500).json({ msg: 'Error exporting data' });
  }
};

// Export training bookings data
const exportTrainingBookings = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    let query = {};
    if (eventId) {
      query.trainingEvent = eventId;
    }

    const bookings = await TrainingBooking.find(query)
      .populate('trainingEvent', 'title startDate endDate')
      .lean();

    const csvData = bookings.map(booking => ({
      'Booking ID': booking._id,
      'Training Event': booking.trainingEvent?.title || '',
      'Event Start Date': booking.trainingEvent?.startDate ? new Date(booking.trainingEvent.startDate).toLocaleDateString() : '',
      'Participant Name': booking.participant.name,
      'Participant Email': booking.participant.email,
      'Participant Phone': booking.participant.phone || '',
      'Organization': booking.participant.organization || '',
      'Role': booking.participant.role || '',
      'Status': booking.status,
      'Booking Method': booking.bookingMethod,
      'Attended': booking.attendance?.attended ? 'Yes' : 'No',
      'Attendance Date': booking.attendance?.attendanceDate ? new Date(booking.attendance.attendanceDate).toLocaleDateString() : '',
      'Duration': booking.attendance?.duration || '',
      'Completed': booking.completion?.completed ? 'Yes' : 'No',
      'Completion Date': booking.completion?.completionDate ? new Date(booking.completion.completionDate).toLocaleDateString() : '',
      'Certificate Generated': booking.completion?.certificateGenerated ? 'Yes' : 'No',
      'Payment Amount': booking.payment?.amount || '',
      'Payment Status': booking.payment?.status || '',
      'Payment Date': booking.payment?.paidAt ? new Date(booking.payment.paidAt).toLocaleDateString() : '',
      'Booking Date': new Date(booking.created_at).toLocaleDateString()
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=training-bookings.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting training bookings:', error);
    res.status(500).json({ msg: 'Error exporting data' });
  }
};

// Export payment history
const exportPaymentHistory = async (req, res) => {
  try {
    console.log('Starting payment history export...');
    
    const invoices = await Invoice.find()
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'caseReferenceNumber')
      .populate('createdBy', 'name')
      .lean();

    console.log(`Found ${invoices.length} invoices for export`);

    const csvData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Client Name': invoice.client.name,
      'Client Email': invoice.client.email || '',
      'Client Phone': invoice.client.phone || '',
      'Client Organization': invoice.client.organization || '',
      'Related Training Event': invoice.relatedTrainingEvent?.title || '',
      'Related Case': invoice.relatedCase?.caseReferenceNumber || '',
      'Subtotal': invoice.subtotal.toFixed(2),
      'Tax Rate': invoice.taxRate,
      'Tax Amount': invoice.taxAmount.toFixed(2),
      'Total Amount': invoice.total.toFixed(2),
      'Currency': invoice.currency,
      'Status': invoice.status,
      'Due Date': invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
      'Issue Date': invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : '',
      'Paid Date': invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '',
      'Payment Method': invoice.paymentMethod || '',
      'Created By': invoice.createdBy?.name || '',
      'Notes': invoice.notes || '',
      'Created Date': invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : ''
    }));

    console.log('CSV data prepared, generating CSV...');

    const parser = new Parser();
    const csv = parser.parse(csvData);

    console.log('CSV generated successfully, sending response...');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payment-history.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting payment history:', error);
    res.status(500).json({ msg: 'Error exporting data', error: error.message });
  }
};

module.exports = {
  exportTrainingEvents,
  exportTrainingBookings,
  exportPaymentHistory,
  // New exports
  exportContacts: async (req, res) => {
    try {
      const contacts = await Contact.find().lean();
      const csvData = contacts.map(c => ({
        'Contact ID': c._id,
        'Name': c.name,
        'Email': c.email || '',
        'Phone': c.phone || '',
        'Organization': c.organizationName || '',
        'Type': c.contactType || c.type || '',
        'Tags': Array.isArray(c.tags) ? c.tags.join(', ') : '',
        'Interest Areas': Array.isArray(c.interestAreas) ? c.interestAreas.join(', ') : '',
        'Lead Source': c.leadSource || '',
        'Lead Score': c.leadScore ?? '',
        'Status': c.status || '',
        'Next Follow-up': c.nextFollowUpDate ? new Date(c.nextFollowUpDate).toLocaleDateString() : '',
        'Last Contact': c.lastContactDate ? new Date(c.lastContactDate).toLocaleDateString() : '',
        'Created Date': c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
      }));
      const parser = new Parser();
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      res.status(500).json({ msg: 'Error exporting data' });
    }
  },
  exportEnquiries: async (req, res) => {
    try {
      const enquiries = await Enquiry.find().lean();
      const csvData = enquiries.map(e => ({
        'Enquiry ID': e._id,
        'Full Name': e.full_name,
        'Email': e.email_address,
        'Telephone': e.telephone || '',
        'Location': e.location || '',
        'Post Code': e.post_code || '',
        'Submission Date': e.submission_date ? new Date(e.submission_date).toLocaleDateString() : '',
        'Pipeline Stage': e.pipelineStage || '',
        'Status': e.status || '',
        'Assigned Mentor': e.assignedMentor ? String(e.assignedMentor) : '',
        'Assigned Assessor': e.assignedAssessor ? String(e.assignedAssessor) : '',
        'Paused Until': e.pausedUntil ? new Date(e.pausedUntil).toLocaleDateString() : '',
        'Rejection Reason': e.rejection_reason || ''
      }));
      const parser = new Parser();
      const csv = parser.parse(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=enquiries.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exporting enquiries:', error);
      res.status(500).json({ msg: 'Error exporting data' });
    }
  }
};
