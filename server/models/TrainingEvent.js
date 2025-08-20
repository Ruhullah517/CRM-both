const mongoose = require('mongoose');

const TrainingEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  virtualMeetingLink: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxParticipants: { type: Number, default: 20 },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'GBP' },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'], 
    default: 'draft' 
  },
  bookingLink: String, // Auto-generated unique link for public booking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  materials: [{
    name: String,
    url: String,
    type: String // 'document', 'video', 'link'
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingEvent', TrainingEventSchema);
