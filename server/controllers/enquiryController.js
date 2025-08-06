const Enquiry = require('../models/Enquiry');
const Contact = require('../models/Contact');

// List all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate('assigned_to', 'name');
    res.json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single enquiry by ID
const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('assigned_to', 'name');
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    // For compatibility with old code, add assigned_to_name
    const obj = enquiry.toObject();
    obj.assigned_to_name = obj.assigned_to?.name || '';
    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Approve an enquiry
const approveEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.json({ msg: 'Enquiry approved' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Reject an enquiry
const rejectEnquiry = async (req, res) => {
  const { reason } = req.body;
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { status: 'Rejected', rejection_reason: reason });
    res.json({ msg: 'Enquiry rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign an enquiry to a staff member
const assignEnquiry = async (req, res) => {
  const { staffId } = req.body;
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { assigned_to: staffId });
    res.json({ msg: 'Enquiry assigned' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new enquiry
const wpToSchemaMap = {
  "fields.name.raw_value": "full_name",
  "fields.email.raw_value": "email_address",
  "fields.field_423164f.raw_value": "telephone",
  "fields.field_2a317f5.raw_value": "location",
  "fields.field_b22750f.raw_value": "post_code",
  "fields.field_81b3283.raw_value": "nationality",
  "fields.field_793d27f.raw_value": "ethnicity",
  "fields.field_8273cb2.raw_value": "sexual_orientation",
  "fields.field_516bfb9.raw_value": "over_21",
  "fields.field_8009a6e.raw_value": "dob",
  "fields.field_8801a53.raw_value": "occupation",
  "fields.field_ca73cb2.raw_value": "foster_as_couple",
  "fields.field_4651c0a.raw_value": "has_spare_room",
  "fields.field_297dc35.raw_value": "property_bedrooms_details",
  "fields.field_9f44fd8.raw_value": "has_children_or_caring_responsibilities",
  "fields.field_a524f69.raw_value": "previous_investigation",
  "fields.field_49e974f.raw_value": "previous_experience",
  "fields.field_5df29d0.raw_value": "motivation",
  "fields.field_92c067e.raw_value": "support_needs",
  "fields.field_056ef3c.raw_value": "availability_for_call", // date
  "fields.field_aeb788a.raw_value": "availability_for_call_time", // time
  "fields.field_aa203a2.raw_value": "how_did_you_hear",
  "fields.field_459f42f.raw_value": "information_correct_confirmation",
};

function transformWpEnquiry(wpData) {
  const result = {};
  for (const [wpKey, schemaKey] of Object.entries(wpToSchemaMap)) {
    if (wpData[wpKey] !== undefined) {
      result[schemaKey] = wpData[wpKey];
    }
  }
  // Combine date and time if both exist
  if (result.availability_for_call && result.availability_for_call_time) {
    result.availability_for_call = `${result.availability_for_call} ${result.availability_for_call_time}`;
    delete result.availability_for_call_time;
  }
  // Convert booleans and other types as needed
  result.over_21 = result.over_21 === "1" || result.over_21 === "Yes" || result.over_21 === "on";
  result.has_spare_room = result.has_spare_room === "Yes" || result.has_spare_room === "on";
  result.foster_as_couple = result.foster_as_couple === "Yes" || result.foster_as_couple === "on";
  result.has_children_or_caring_responsibilities = result.has_children_or_caring_responsibilities === "Yes" || result.has_children_or_caring_responsibilities === "on";
  result.previous_investigation = result.previous_investigation === "Yes" || result.previous_investigation === "on";
  result.previous_experience = result.previous_experience === "Yes" || result.previous_experience === "on";
  result.information_correct_confirmation = result.information_correct_confirmation === "on" || result.information_correct_confirmation === "Yes";
  return result;
}

async function createOrUpdateContactFromEnquiry(enquiry) {
  if (!enquiry.email_address) return;
  let contact = await Contact.findOne({ email: enquiry.email_address });
  if (!contact) {
    contact = new Contact({
      name: enquiry.full_name,
      email: enquiry.email_address,
      phone: enquiry.telephone,
      tags: ['Enquiry'],
      notes: '',
      organizationName: '',
      organizationAddress: '',
      communicationHistory: [],
    });
  } else {
    if (!contact.tags.includes('Enquiry')) {
      contact.tags.push('Enquiry');
    }
    if (!contact.name && enquiry.full_name) contact.name = enquiry.full_name;
    if (!contact.phone && enquiry.telephone) contact.phone = enquiry.telephone;
  }
  await contact.save();
}

const createEnquiry = async (req, res) => {
  try {
    // Accept both direct and nested (WordPress) body
    const wpData = req.body.bdy || req.body;
    const enquiryData = transformWpEnquiry(wpData);
    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();
    // Create or update contact
    await createOrUpdateContactFromEnquiry(enquiry);
    res.status(201).json({ id: enquiry._id, msg: 'Enquiry created successfully' });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).send('Server error');
  }
};

// Delete an enquiry
const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Enquiry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new enquiry
// const createEnquiry = async (req, res) => {
//   try {
//     console.log(req.body);
//     const enquiry = new Enquiry(req.body);
//     await enquiry.save();
//     res.status(201).json({ id: enquiry._id, msg: 'Enquiry created successfully' });
//   } catch (error) {
//     console.error('Error creating enquiry:', error);
//     res.status(500).send('Server error');
//   }
// };

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  approveEnquiry,
  rejectEnquiry,
  assignEnquiry,
  deleteEnquiry,
}; 