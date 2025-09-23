const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueAt: { type: Date, required: true },
  entityType: { type: String, enum: ['enquiry', 'case', 'training', 'invoice', 'other'], default: 'other' },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', ReminderSchema);


