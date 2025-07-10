const mongoose = require('mongoose');

const FreelancerSchema = new mongoose.Schema({
  // Section 1: Personal Information
  fullName: { type: String, required: true },
  homeAddress: String,
  email: String,
  mobileNumber: String,
  isOnWhatsApp: Boolean,

  // Section 2: Professional Information
  hasSocialWorkEnglandRegistration: Boolean,
  socialWorkEnglandRegistrationNumber: String,
  hasDBSCheck: Boolean,
  isOnUpdateSystem: Boolean,
  dbsCertificateUrl: String, // Google Drive or uploaded file link
  dbsCertificateFileName: String,

  // Section 3: Location & Availability
  currentLocation: String,
  geographicalLocation: String, // e.g., "North East"
  role: String, // e.g., "Foster Carer"
  milesWillingToTravel: String,

  // Section 4: Work Experience & Skills
  hasFormFAssessmentExperience: Boolean,
  formFAssessmentExperienceYears: String,
  otherSocialWorkAssessmentExperience: [String],

  // Section 5: Consideration for Work & Training
  considerationFor: [String],

  // Section 6: Additional Information
  qualificationsAndTraining: String,
  additionalInfo: String,
  professionalReferences: String,
  cvUrl: String, // Google Drive or uploaded file link
  cvFileName: String,

  // Section 7: Payment & Tax Information
  paymentPreferences: [String],
  paymentOther: String,

  // Legacy fields (for compatibility)
  name: String,
  roleLegacy: String,
  status: String,
  availability: String,
  skills: [String],
  complianceDocs: [String],
  assignments: [String],
  contract_date: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Freelancer', FreelancerSchema); 