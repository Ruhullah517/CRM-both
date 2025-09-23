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
    enum: ['New', 'Active', 'Paused', 'Completed', 'Withdrawn'],
    default: 'New' 
  },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejection_reason: String,

  // Assignments
  assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  assignedAssessor: { type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' },
  mentorNotes: String,
  assessorNotes: String,

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