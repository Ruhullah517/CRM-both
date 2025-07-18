const Case = require('../models/Case');
const { v4: uuidv4 } = require('uuid');

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
    const fileUrl = `https://crm-backend-0v14.onrender.com/uploads/${req.file.filename}`;
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

module.exports = {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  uploadCaseFile,
  assignCaseworkers
}; 