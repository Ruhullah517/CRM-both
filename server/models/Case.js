const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  person: { type: String, required: true },
  type: String,
  status: { type: String, default: 'Open' },
  assignedCaseworker: String,
  startDate: Date,
  activity: [{ action: String, date: Date }],
  uploads: [{ name: String, url: String }],
  reminders: [{ text: String, date: Date }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', CaseSchema); 