const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');
const Invoice = require('../models/Invoice');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');
const { Parser } = require('json2csv');

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
    const invoices = await Invoice.find()
      .populate('relatedTrainingEvent', 'title')
      .populate('relatedCase', 'title')
      .populate('createdBy', 'name')
      .lean();

    const csvData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Client Name': invoice.client.name,
      'Client Email': invoice.client.email || '',
      'Client Organization': invoice.client.organization || '',
      'Related Training': invoice.relatedTrainingEvent?.title || '',
      'Related Case': invoice.relatedCase?.title || '',
      'Subtotal': invoice.subtotal,
      'Tax Rate': invoice.taxRate,
      'Tax Amount': invoice.taxAmount,
      'Total': invoice.total,
      'Currency': invoice.currency,
      'Status': invoice.status,
      'Due Date': new Date(invoice.dueDate).toLocaleDateString(),
      'Issued Date': new Date(invoice.issuedDate).toLocaleDateString(),
      'Paid Date': invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '',
      'Payment Method': invoice.paymentMethod || '',
      'Created By': invoice.createdBy?.name || '',
      'Notes': invoice.notes || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payment-history.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting payment history:', error);
    res.status(500).json({ msg: 'Error exporting data' });
  }
};

module.exports = {
  exportTrainingEvents,
  exportTrainingBookings,
  exportPaymentHistory
};
