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
  status: { 
    type: String, 
    enum: ['New Enquiry', 'Initial Assessment', 'Full Assessment', 'Mentor Allocation', 'Active Mentoring', 'On Hold', 'Escalated', 'Assessment Fail', 'Screen Failed', 'Closed', 'Completed'],
    default: 'New Enquiry' 
  },
  type_of_enquiry: {
    type: String,
    enum: ['fostering', 'mentoring_request', 'other'],
    default: 'fostering'
  },
  preferred_contact_time: String,
  source: {
    type: String,
    enum: ['web_form', 'manual_referral', 'phone', 'email', 'partner'],
    default: 'web_form'
  },
  referrer: String,
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejection_reason: String,

  // Assignments
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  assignedAssessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
  mentorNotes: String,
  assessorNotes: String,

  // Initial Assessment fields
  initialAssessment: {
    result: { type: String, enum: ['Pass', 'Fail', 'Needs More Info'] },
    assessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assessmentDate: Date,
    notes: String,
    eligibilityChecks: {
      age: Boolean,
      over21: Boolean,
      location: Boolean,
      criminalHistory: Boolean,
      safeguardingConcerns: Boolean
    },
    availability: {
      willingToFoster: Boolean,
      spareRoom: Boolean,
      timesDates: String
    },
    suitability: {
      caringResponsibilities: Boolean,
      previousInvestigations: Boolean,
      experience: Boolean
    }
  },

  // Full Assessment fields
  fullAssessment: {
    result: { type: String, enum: ['Proceed', 'Do not proceed', 'Hold'] },
    assessorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
    assessmentDate: Date,
    notes: String,
    backgroundChecks: {
      dbs: Boolean,
      references: Boolean,
      homeSafety: Boolean
    },
    personalHistory: String,
    supportNeeds: String,
    trainingNeeds: String,
    documents: [{
      type: String,
      url: String,
      name: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },

  // Mentor Allocation fields
  mentorAllocation: {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
    startDate: Date,
    meetingSchedule: String,
    objectives: String,
    frequency: String,
    duration: String,
    notesTemplate: String
  },

  // Case Closure fields
  caseClosure: {
    closureDate: Date,
    closureReason: String,
    outcomes: String,
    lessonsLearned: String,
    finalReport: String,
    closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // Lifecycle controls
  statusReason: String,
  pausedUntil: Date,

  // Unified pipeline fields
  pipelineStage: { 
    type: String, 
    enum: ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'], 
    default: 'Enquiry' 
  },
  stageEntries: [
    {
      stage: { type: String, enum: ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'], required: true },
      meetingType: { type: String, enum: ['Telephone', 'Online', 'Home Visit', 'Face to Face', 'Other'], default: 'Other' },
      meetingDate: { type: Date },
      notes: { type: String },
      files: [
        {
          url: { type: String, required: true },
          name: { type: String },
          uploadedAt: { type: Date, default: Date.now }
        }
      ],
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ]
  ,

  // Per-stage deadlines and completion tracking
  stageDeadlines: [
    {
      stage: { type: String, enum: ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'], required: true },
      dueAt: { type: Date, required: true },
      completedAt: { type: Date },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Enquiry', EnquirySchema); 