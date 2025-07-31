const mongoose = require('mongoose');

const FreelancerFormTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // auto-delete after 7 days
});

module.exports = mongoose.model('FreelancerFormToken', FreelancerFormTokenSchema);