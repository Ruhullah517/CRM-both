const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  // Personal Details
  full_name: { type: String, required: true },
  email_address: { type: String, required: true },
  telephone: String,
  location: String,
  post_code: String,
  nationality: String,
  ethnicity: String,
  sexual_orientation: String,
  over_21: Boolean,
  dob: Date,
  occupation: String,

  // Fostering Details
  foster_as_couple: Boolean,
  has_spare_room: Boolean,
  property_bedrooms_details: String,

  // Experience & Checks
  has_children_or_caring_responsibilities: Boolean,
  previous_investigation: Boolean,
  previous_experience: Boolean,

  // Motivation & Support
  motivation: String,
  support_needs: String,

  // Availability & Confirmation
  availability_for_call: String,
  how_did_you_hear: String,
  information_correct_confirmation: Boolean,

  // CRM-specific fields
  submission_date: { type: Date, default: Date.now },
  status: { type: String, default: 'New' },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejection_reason: String
});

module.exports = mongoose.model('Enquiry', EnquirySchema); 