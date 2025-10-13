const mongoose = require('mongoose');

const FreelancerSchema = new mongoose.Schema({
  // Section 1: Personal Information
  fullName: { type: String, required: true },
  homeAddress: String,
  email: { type: String, index: true },
  mobileNumber: String,
  isOnWhatsApp: Boolean,

  // Section 2: Professional Information
  hasSocialWorkEnglandRegistration: Boolean,
  socialWorkEnglandRegistrationNumber: String,
  hasDBSCheck: Boolean,
  isOnUpdateSystem: Boolean,
  dbsCertificateUrl: String,      // Google Drive or uploaded file link
  dbsCertificateFileName: String, // Display name

  // Section 3: Location & Availability
  currentLocation: String,
  geographicalLocation: String, // e.g., "North East"
  role: String,                 // e.g., "Foster Carer"
  milesWillingToTravel: String,

  // Section 4: Work Experience & Skills
  hasFormFAssessmentExperience: Boolean,
  formFAssessmentExperienceYears: String,
  otherSocialWorkAssessmentExperience: [String],

  // Section 5: Consideration for Work & Training
  considerationFor: [String], // e.g., ["Initial Assessment", "Form F", "Training"]
  roles: [String], // e.g., ["assessor", "trainer", "mentor"] - defines what jobs they can be assigned to

  // Section 6: Additional Information
  qualificationsAndTraining: String,
  additionalInfo: String,
  professionalReferences: String,
  cvUrl: String,
  cvFileName: String,

  // Section 7: Payment & Tax Information
  paymentPreferences: [String], // e.g., ["Limited Company", "Umbrella"]
  paymentOther: String,

  // Meta / Admin Info
  source: { type: String, enum: ['admin', 'freelancer'], default: 'freelancer' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  // HR Module Enhancements
  hourlyRate: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  availability: { 
    type: String, 
    enum: ['available', 'busy', 'unavailable'], 
    default: 'available' 
  },
  availabilityNotes: String,
  complianceDocuments: [{
    name: String,
    type: { type: String, enum: ['dbs', 'insurance', 'qualification', 'other'] },
    expiryDate: Date,
    fileUrl: String,
    fileName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  workHistory: [{
    assignment: String,
    startDate: Date,
    endDate: Date,
    hours: Number,
    rate: Number,
    totalAmount: Number,
    status: { type: String, enum: ['completed', 'in_progress', 'cancelled'] },
    notes: String
  }],
  contractRenewalDate: Date,
  contractStatus: { type: String, enum: ['active', 'expired', 'pending_renewal'], default: 'active' },

  // Legacy fields (optional: to support older system)
  legacy: {
    name: String,
    role: String,
    availability: String,
    skills: [String],
    complianceDocs: [String],
    assignments: [String],
    contract_date: Date
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Freelancer', FreelancerSchema);