const Candidate = require('../models/Candidate');
const Enquiry = require('../models/Enquiry');
const fs = require('fs');
const path = require('path');

// List all candidates (including approved enquiries as foster carers)
const getAllCandidates = async (req, res) => {
  try {
    // Get regular candidates
    const candidates = await Candidate.find();

    // Get approved enquiries and convert them to candidate format
    const approvedEnquiries = await Enquiry.find({ status: 'Approved' })
      .populate('assigned_to', 'name')
      .populate('mentorAllocation.mentorId', 'name')
      .populate('caseClosure.closedBy', 'name');

    // Convert approved enquiries to candidate format
    const fosterCarersFromEnquiries = approvedEnquiries.map((enquiry) => ({
      _id: enquiry._id,
      name: enquiry.full_name,
      email: enquiry.email_address,
      phone: enquiry.telephone,
      status: 'Active', // Approved enquiries become active foster carers
      stage: 'Approval', // They've completed the approval stage
      mentor: enquiry.mentorAllocation?.mentorId?.name || 'Not assigned',
      deadline: enquiry.caseClosure?.closureDate || enquiry.updatedAt,
      notes: enquiry.caseClosure?.outcomes
        ? [
            {
              text: enquiry.caseClosure.outcomes,
              date: enquiry.caseClosure.closureDate,
            },
          ]
        : [],
      documents: [], // Could be populated from assessment documents if needed
      // Additional fields from enquiry
      location: enquiry.location,
      postCode: enquiry.post_code,
      submissionDate: enquiry.submission_date,
      approvedDate: enquiry.caseClosure?.closureDate,
      approvedBy: enquiry.caseClosure?.closedBy?.name,
      assignedTo: enquiry.assigned_to?.name,
      // Flag to identify this came from an enquiry
      fromEnquiry: true,
      originalEnquiryId: enquiry._id,
    }));

    // Combine regular candidates with foster carers from approved enquiries
    const allCandidates = [...candidates, ...fosterCarersFromEnquiries];

    res.json(allCandidates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ msg: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new candidate (used by the internal CRM UI)
const createCandidate = async (req, res) => {
  const {
    name,
    email,
    phone,
    mentor,
    status,
    stage,
    notes,
    documents,
    deadline,
    location,
    postCode,
  } = req.body;
  try {
    const candidate = new Candidate({
      name,
      email,
      phone,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline,
      location,
      postCode,
    });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Helper to normalise WordPress payload into our Candidate schema
// WordPress sends data in format: fields.field_XXXXXXX.raw_value
// Replace the field_XXXXXXX placeholders below with actual WordPress field IDs from your form
const wpCandidateFieldMap = {
  // Basic Information
  'fields.name.raw_value': 'name', // Common field name, may also be fields.field_XXXXXXX.raw_value
  'fields.field_PLACEHOLDER1.raw_value': 'name', // TODO: Replace PLACEHOLDER1 with actual WP field ID for Full Name
  'fields.email.raw_value': 'email', // Common field name
  'fields.field_PLACEHOLDER2.raw_value': 'email', // TODO: Replace PLACEHOLDER2 with actual WP field ID for Email Address
  'fields.field_PLACEHOLDER3.raw_value': 'phone', // TODO: Replace PLACEHOLDER3 with actual WP field ID for Telephone
  'fields.field_PLACEHOLDER4.raw_value': 'postCode', // TODO: Replace PLACEHOLDER4 with actual WP field ID for Post Code
  
  // Local Authority / Organisation Details
  'fields.field_PLACEHOLDER5.raw_value': 'localAuthorityOrAgency', // TODO: Replace with WP field ID for "Local authority or fostering agency"
  'fields.field_PLACEHOLDER6.raw_value': 'organisationName', // TODO: Replace with WP field ID for "Name of Organisation"
  'fields.field_PLACEHOLDER7.raw_value': 'socialWorkerName', // TODO: Replace with WP field ID for "Name of Social Worker"
  'fields.field_PLACEHOLDER8.raw_value': 'socialWorkerEmail', // TODO: Replace with WP field ID for "Social Workers Email Address"
  'fields.field_PLACEHOLDER9.raw_value': 'socialWorkerMobile', // TODO: Replace with WP field ID for "Social Workers Mobile"
  
  // Mentoring Details
  'fields.field_PLACEHOLDER10.raw_value': 'mentorRequiredFor', // TODO: Replace with WP field ID for "Mentor required for"
  'fields.field_PLACEHOLDER11.raw_value': 'isCurrentlyCaring', // TODO: Replace with WP field ID for "Are you currently caring for a child or young person?"
  'fields.field_PLACEHOLDER12.raw_value': 'isTransracialPlacement', // TODO: Replace with WP field ID for "Is this a transracial placement?"
  'fields.field_PLACEHOLDER13.raw_value': 'ageRangeOfChild', // TODO: Replace with WP field ID for "Age range of the child / young person?"
  'fields.field_PLACEHOLDER14.raw_value': 'childBackground', // TODO: Replace with WP field ID for child's racial/ethnic/cultural background
  'fields.field_PLACEHOLDER15.raw_value': 'benefitsFromMentoring', // TODO: Replace with WP field ID for "What do you feel the child would benefit from most..."
  'fields.field_PLACEHOLDER16.raw_value': 'promptedToSeekMentoring', // TODO: Replace with WP field ID for "What has prompted you to seek cultural mentoring..."
  'fields.field_PLACEHOLDER17.raw_value': 'areasOfSupport', // TODO: Replace with WP field ID for "What areas of support are you seeking" (checkboxes/multi-select)
  'fields.field_PLACEHOLDER18.raw_value': 'preferredMentoringApproach', // TODO: Replace with WP field ID for "Preferred mentoring approach"
  'fields.field_PLACEHOLDER19.raw_value': 'preferredDeliveryMethod', // TODO: Replace with WP field ID for "Preferred delivery method"
  'fields.field_PLACEHOLDER20.raw_value': 'frequencyOfSupport', // TODO: Replace with WP field ID for "Frequency of support"
  'fields.field_PLACEHOLDER21.raw_value': 'availabilityForFollowUpCall', // TODO: Replace with WP field ID for "Your Availability for follow-up call"
  'fields.field_PLACEHOLDER22.raw_value': 'howDidYouHear', // TODO: Replace with WP field ID for "How did you hear about us?"
  'fields.field_PLACEHOLDER23.raw_value': 'consentToContact', // TODO: Replace with WP field ID for consent checkbox
};

// Helper to support both flattened keys (e.g., "fields.field_12345.raw_value")
// and nested objects (e.g., { fields: { field_12345: { raw_value: '...' }}})
function getNestedValue(data, key) {
  if (data[key] !== undefined) return data[key];
  const parts = key.split('.');
  let cur = data;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      return undefined;
    }
  }
  return cur;
}

function transformWpCandidate(wpData) {
  const result = {};

  // Map any known "fields.xxx.raw_value" keys into our schema
  Object.entries(wpCandidateFieldMap).forEach(([wpKey, schemaKey]) => {
    const val = getNestedValue(wpData, wpKey);
    if (val !== undefined) {
      result[schemaKey] = val;
    }
  });

  // Fallbacks for simpler payloads where keys match labels more closely
  if (!result.name) {
    result.name =
      wpData.full_name || wpData.name || wpData.FullName || wpData['Full Name'];
  }
  if (!result.email) {
    result.email =
      wpData.email_address ||
      wpData.email ||
      wpData.Email ||
      wpData['Email Address'];
  }
  if (!result.phone) {
    result.phone =
      wpData.telephone || wpData.phone || wpData['Telephone'] || wpData['Phone'];
  }
  if (!result.postCode) {
    result.postCode = wpData.post_code || wpData['Post Code'] || wpData.postcode;
  }

  result.localAuthorityOrAgency =
    result.localAuthorityOrAgency ||
    wpData['Local authority or fostering agency'] ||
    wpData.local_authority ||
    wpData['Local Authority'];

  result.organisationName =
    result.organisationName ||
    wpData['Name of Organisation'] ||
    wpData.organisation_name;

  result.socialWorkerName =
    result.socialWorkerName ||
    wpData['Name of Social Worker'] ||
    wpData.social_worker_name;

  result.socialWorkerEmail =
    result.socialWorkerEmail ||
    wpData['Social Workers Email Address'] ||
    wpData.social_worker_email;

  result.socialWorkerMobile =
    result.socialWorkerMobile ||
    wpData['Social Workers Mobile'] ||
    wpData.social_worker_mobile;

  result.mentorRequiredFor =
    result.mentorRequiredFor ||
    wpData['Mentor required for'] ||
    wpData.mentor_required_for;

  // Booleans from common Yes/No / checkbox formats
  const toBool = (val) =>
    val === true ||
    val === '1' ||
    val === 'yes' ||
    val === 'Yes' ||
    val === 'on' ||
    val === 'true';

  if (result.isCurrentlyCaring === undefined) {
    const raw =
      wpData['Are you currently caring for a child or young person?'] ||
      wpData.currently_caring;
    if (raw !== undefined) result.isCurrentlyCaring = toBool(raw);
  }

  if (result.isTransracialPlacement === undefined) {
    const raw =
      wpData['Is this a transracial placement?'] ||
      wpData.transracial_placement;
    if (raw !== undefined) result.isTransracialPlacement = toBool(raw);
  }

  result.ageRangeOfChild =
    result.ageRangeOfChild ||
    wpData['Age range of the child / young person?'] ||
    wpData.age_range;

  result.childBackground =
    result.childBackground ||
    wpData["How would you describe the child or young person’s racial, ethnic, or cultural background"] ||
    wpData.child_background;

  result.benefitsFromMentoring =
    result.benefitsFromMentoring ||
    wpData[
      'What do you feel the child or young person would benefit from most through cultural mentoring?'
    ] ||
    wpData.benefits_from_mentoring;

  result.promptedToSeekMentoring =
    result.promptedToSeekMentoring ||
    wpData['What has prompted you to seek cultural mentoring at this time?'] ||
    wpData.prompted_to_seek_mentoring;

  // Areas of support – can come as array or comma-separated string
  if (!result.areasOfSupport) {
    const rawAreas =
      wpData['What areas of support are you seeking'] ||
      wpData.areas_of_support;
    if (Array.isArray(rawAreas)) {
      result.areasOfSupport = rawAreas;
    } else if (typeof rawAreas === 'string') {
      result.areasOfSupport = rawAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  result.preferredMentoringApproach =
    result.preferredMentoringApproach ||
    wpData['Preferred mentoring approach'] ||
    wpData.preferred_mentoring_approach;

  result.preferredDeliveryMethod =
    result.preferredDeliveryMethod ||
    wpData['Preferred delivery method'] ||
    wpData.preferred_delivery_method;

  result.frequencyOfSupport =
    result.frequencyOfSupport ||
    wpData['Frequency of support'] ||
    wpData.frequency_of_support;

  result.availabilityForFollowUpCall =
    result.availabilityForFollowUpCall ||
    wpData['Your Availability for follow-up call'] ||
    wpData.availability_for_followup_call;

  result.howDidYouHear =
    result.howDidYouHear ||
    wpData['How did you hear about us?'] ||
    wpData.how_did_you_hear;

  if (result.consentToContact === undefined) {
    const rawConsent =
      wpData[
        'I consent to my information being used to contact me about cultural mentoring support in line with the organisation’s privacy policy'
      ] || wpData.consent;
    if (rawConsent !== undefined) result.consentToContact = toBool(rawConsent);
  }

  // Default pipeline status for these web-only mentees
  if (!result.status) result.status = 'Active';
  if (!result.stage) result.stage = 'Mentoring';

  // Ensure we always have a source label for reporting
  if (!result.source) {
    result.source = 'wordpress_mentoring_form';
  }

  return result;
}

// Public API: create candidate/mentee directly from WordPress cultural mentoring form
const createCandidateFromWpForm = async (req, res) => {
  try {
    const wpData = req.body.bdy || req.body;
    
    // ============================================
    // DEBUG: Log WordPress payload structure
    // ============================================
    // This helps you identify the actual WordPress field IDs
    // Check your server console/logs OR the log file to see this output
    
    const getAllKeys = (obj, prefix = '') => {
      const keys = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys.push(...getAllKeys(obj[key], fullKey));
          } else {
            keys.push(fullKey);
          }
        }
      }
      return keys;
    };
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      fullRequestBody: req.body,
      extractedWordPressData: wpData,
      allKeys: typeof wpData === 'object' && wpData !== null ? getAllKeys(wpData) : []
    };
    
    // Console logging
    console.log('\n========================================');
    console.log('WORDPRESS CANDIDATE FORM PAYLOAD RECEIVED');
    console.log('========================================');
    console.log('Timestamp:', logEntry.timestamp);
    console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
    console.log('\nExtracted WordPress Data:', JSON.stringify(wpData, null, 2));
    console.log('\nAll Keys in WordPress Data:');
    logEntry.allKeys.forEach(key => console.log(`  - ${key}`));
    console.log('========================================\n');
    
    // File logging (saves to server/uploads/wp-candidate-debug.log)
    try {
      const logFilePath = path.join(__dirname, '../uploads/wp-candidate-debug.log');
      const logLine = `\n${'='.repeat(80)}\n${logEntry.timestamp}\n${'='.repeat(80)}\n` +
        `Full Request Body:\n${JSON.stringify(req.body, null, 2)}\n\n` +
        `Extracted WordPress Data:\n${JSON.stringify(wpData, null, 2)}\n\n` +
        `All Keys:\n${logEntry.allKeys.map(k => `  - ${k}`).join('\n')}\n`;
      fs.appendFileSync(logFilePath, logLine, 'utf8');
      console.log(`Payload also logged to: ${logFilePath}`);
    } catch (fileError) {
      console.error('Could not write to log file:', fileError.message);
    }
    
    const candidateData = transformWpCandidate(wpData);
    
    // Also log what we extracted
    console.log('Transformed Candidate Data:', JSON.stringify(candidateData, null, 2));
    console.log('========================================\n');

    if (!candidateData.name) {
      // For debugging: return the payload structure in error response
      // Remove this after you've identified all field IDs
      return res.status(400).json({ 
        msg: 'Full Name is required to create a candidate',
        debug: {
          receivedPayload: wpData,
          extractedData: candidateData,
          allKeys: typeof wpData === 'object' ? Object.keys(wpData) : []
        }
      });
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res
      .status(201)
      .json({ id: candidate._id, msg: 'Candidate created successfully' });
  } catch (error) {
    console.error('Error creating candidate from WordPress form:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      msg: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a candidate
const updateCandidate = async (req, res) => {
  const {
    name,
    email,
    phone,
    mentor,
    status,
    stage,
    notes,
    documents,
    deadline,
    location,
    postCode,
  } = req.body;
  try {
    await Candidate.findByIdAndUpdate(req.params.id, {
      name,
      email,
      phone,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline,
      location,
      postCode,
    });
    res.json({ msg: 'Candidate updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a candidate
const deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Candidate deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign mentor to candidate
const assignMentorToCandidate = async (req, res) => {
  const { mentor } = req.body;
  const Mentor = require('../models/Mentor');

  try {
    // Get the current candidate to check if they already have a mentor
    const currentCandidate = await Candidate.findById(req.params.id);
    const candidateId = req.params.id;

    // Remove candidate from previous mentor's mentees array
    if (currentCandidate.mentor && currentCandidate.mentor !== mentor) {
      const previousMentor = await Mentor.findOne({
        name: currentCandidate.mentor,
      });
      if (previousMentor) {
        await Mentor.findByIdAndUpdate(previousMentor._id, {
          $pull: { mentees: candidateId },
        });
      }
    }

    // Update candidate's mentor
    await Candidate.findByIdAndUpdate(req.params.id, { mentor });

    // Add candidate to new mentor's mentees array
    if (mentor) {
      const mentorDoc = await Mentor.findOne({ name: mentor });
      if (mentorDoc) {
        // Add candidate to mentor's mentees if not already there
        if (!mentorDoc.mentees.includes(candidateId)) {
          await Mentor.findByIdAndUpdate(mentorDoc._id, {
            $push: { mentees: candidateId },
          });
        }
      }
    }

    res.json({ msg: 'Mentor assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  createCandidateFromWpForm,
  updateCandidate,
  deleteCandidate,
  assignMentorToCandidate,
};