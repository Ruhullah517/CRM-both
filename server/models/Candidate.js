const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  // Core fields for foster carer / mentee list
  name: { type: String, required: true },
  email: String,
  phone: String,
  status: { type: String, default: 'New' }, // New, Active, Paused, Completed
  stage: { type: String, default: 'Inquiry' }, // Inquiry, Application, Assessment, Mentoring, Approval
  mentor: String,
  deadline: Date,
  notes: [{ text: String, date: Date }],
  documents: [{ name: String, url: String }],

  // Basic location details (used for both recruitment and mentoring only forms)
  location: String,
  postCode: String,

  // Fields specific to cultural mentoring requests coming directly from WordPress
  localAuthorityOrAgency: String,
  organisationName: String,
  socialWorkerName: String,
  socialWorkerEmail: String,
  socialWorkerMobile: String,

  mentorRequiredFor: String, // e.g. "Carer", "Child", etc.

  isCurrentlyCaring: Boolean,
  isTransracialPlacement: Boolean,
  ageRangeOfChild: String, // e.g. "0–4"
  childBackground: String, // racial / ethnic / cultural background description

  benefitsFromMentoring: String,
  promptedToSeekMentoring: String,

  // Multiple tick-box areas of support
  areasOfSupport: [String],

  preferredMentoringApproach: String, // e.g. "1:1 mentoring"
  preferredDeliveryMethod: String, // e.g. "Online"
  frequencyOfSupport: String, // e.g. "One-off session"

  availabilityForFollowUpCall: String,
  howDidYouHear: String,

  consentToContact: Boolean,

  // Where this candidate/mentee originated from (manual entry, WP mentoring form, etc.)
  source: String,

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', CandidateSchema);