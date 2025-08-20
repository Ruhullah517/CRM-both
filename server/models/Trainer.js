const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: [String], // e.g., ['Leadership', 'Communication', 'Technical Skills']
  bio: String,
  experience: {
    years: { type: Number, default: 0 },
    description: String
  },
  qualifications: [String], // e.g., ['Certified Trainer', 'MBA', 'PhD']
  hourlyRate: { type: Number, default: 0 },
  availability: {
    weekdays: { type: Boolean, default: true },
    weekends: { type: Boolean, default: false },
    evenings: { type: Boolean, default: true }
  },
  rating: { type: Number, default: 0 },
  totalTrainings: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trainer', TrainerSchema);
