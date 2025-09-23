const Case = require('../models/Case');
const { v4: uuidv4 } = require('uuid');
const Contact = require('../models/Contact');
const CaseMeeting = require('../models/CaseMeeting');

// List all cases
const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single case by ID
const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) return res.status(404).json({ msg: 'Case not found' });
    res.json(caseItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new case
const createCase = async (req, res) => {
  try {
    const {
      clientFullName,
      dateOfBirth,
      gender,
      ethnicity,
      contactInfo,
      address,
      referralSource,
      caseType,
      presentingIssues,
      assignedCaseworkers,
      riskLevel,
      keyDates,
      status,
      pausedReason,
      notes,
      outcomeAchieved,
      supportingDocuments,
      totalTimeLogged,
      invoiceableHours
    } = req.body;

    // Auto-generate unique case reference number
    const caseReferenceNumber = 'CASE-' + uuidv4().split('-')[0].toUpperCase();

    const caseItem = new Case({
      caseReferenceNumber,
      clientFullName,
      dateOfBirth,
      gender,
      ethnicity,
      contactInfo,
      address,
      referralSource,
      caseType,
      presentingIssues,
      assignedCaseworkers,
      riskLevel,
      keyDates,
      status,
      pausedReason,
      notes,
      outcomeAchieved,
      supportingDocuments,
      totalTimeLogged,
      invoiceableHours
    });
    await caseItem.save();
    await createOrUpdateContactsFromCase(caseItem);
    res.status(201).json(caseItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a case
const updateCase = async (req, res) => {
  try {
    const updateFields = req.body;
    await Case.findByIdAndUpdate(req.params.id, updateFields);
    res.json({ msg: 'Case updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a case
const deleteCase = async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Case deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Upload a file for a case and add to supportingDocuments
const uploadCaseFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const { caseId } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileDoc = {
      name: req.file.originalname,
      url: fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req.user ? req.user._id : null
    };
    if (caseId) {
      await Case.findByIdAndUpdate(caseId, { $push: { supportingDocuments: fileDoc } });
    }
    res.json({ ...fileDoc, msg: 'File uploaded and added to case' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign caseworkers (with lead)
const assignCaseworkers = async (req, res) => {
  try {
    const { caseId, caseworkers } = req.body; // caseworkers: [{ userId, isLead }]
    await Case.findByIdAndUpdate(caseId, { assignedCaseworkers: caseworkers });
    res.json({ msg: 'Caseworkers assigned' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

async function createOrUpdateContactFromCasePerson(person, roleTag) {
  if (!person) return;
  const { name, email, phone } = person;
  if (!email && !phone) return;
  let contact = await Contact.findOne(email ? { email } : { phone });
  if (!contact) {
    contact = new Contact({
      name,
      email,
      phone,
      tags: [roleTag, 'Case'],
      notes: '',
      organizationName: '',
      organizationAddress: '',
      communicationHistory: [],
    });
  } else {
    if (!contact.tags.includes(roleTag)) contact.tags.push(roleTag);
    if (!contact.tags.includes('Case')) contact.tags.push('Case');
    if (!contact.name && name) contact.name = name;
    if (!contact.phone && phone) contact.phone = phone;
    if (!contact.email && email) contact.email = email;
  }
  await contact.save();
}

async function createOrUpdateContactsFromCase(caseItem) {
  // Carer (main client)
  await createOrUpdateContactFromCasePerson({
    name: caseItem.clientFullName,
    email: caseItem.contactInfo?.email,
    phone: caseItem.contactInfo?.phone
  }, 'Carer');

  // Referrer
  await createOrUpdateContactFromCasePerson({
    name: caseItem.referralSource,
    email: caseItem.referrerEmail,
    phone: caseItem.referrerContactNumber
  }, 'Referrer');

  // SSW
  await createOrUpdateContactFromCasePerson({
    name: caseItem.referralDetails?.sswName,
    email: caseItem.referralDetails?.sswEmail,
    phone: caseItem.referralDetails?.sswContactNumber
  }, 'SSW');

  // Decision Maker
  await createOrUpdateContactFromCasePerson({
    name: caseItem.referralDetails?.decisionMakerName,
    email: caseItem.referralDetails?.decisionMakerEmail,
    phone: caseItem.referralDetails?.decisionMakerContactNumber
  }, 'Decision Maker');

  // Finance Contact
  await createOrUpdateContactFromCasePerson({
    name: caseItem.referralDetails?.financeContactName,
    email: caseItem.referralDetails?.financeEmail,
    phone: caseItem.referralDetails?.financeContactNumber
  }, 'Finance Contact');
}

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  uploadCaseFile,
  assignCaseworkers
}; 