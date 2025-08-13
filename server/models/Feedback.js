const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  trainingEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingEvent', required: true },
  trainingBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingBooking', required: true },
  participant: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  feedback: {
    overallRating: { type: Number, min: 1, max: 5, required: true },
    contentRating: { type: Number, min: 1, max: 5 },
    trainerRating: { type: Number, min: 1, max: 5 },
    venueRating: { type: Number, min: 1, max: 5 },
    comments: String,
    suggestions: String,
    wouldRecommend: { type: Boolean, default: true }
  },
  issues: [{
    type: { type: String, enum: ['technical', 'content', 'trainer', 'venue', 'other'] },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
    resolution: String
  }],
  submittedAt: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update updated_at before saving
FeedbackSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
