const mongoose = require('mongoose');

const TrainingBookingSchema = new mongoose.Schema({
  trainingEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingEvent', required: true },
  participant: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    organization: String,
    role: String
  },
  status: { 
    type: String, 
    enum: ['registered', 'confirmed', 'attended', 'completed', 'cancelled'], 
    default: 'registered' 
  },
  bookingMethod: { 
    type: String, 
    enum: ['admin', 'public_link'], 
    default: 'admin' 
  },
  attendance: {
    attended: { type: Boolean, default: false },
    attendanceDate: Date,
    duration: String, // e.g., "2.5 hours"
    notes: String
  },
  completion: {
    completed: { type: Boolean, default: false },
    completionDate: Date,
    certificateGenerated: { type: Boolean, default: false },
    certificateUrl: String,
    certificateSent: { type: Boolean, default: false }
  },
  payment: {
    amount: Number,
    currency: { type: String, default: 'GBP' },
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'overdue', 'cancelled'], 
      default: 'pending' 
    },
    paidAt: Date,
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingBooking', TrainingBookingSchema);
