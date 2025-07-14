const Case = require('../models/Case');

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
  const { person, type, status, assignedCaseworker, startDate, activity, uploads, reminders } = req.body;
  try {
    const caseItem = new Case({
      person,
      type,
      status,
      assignedCaseworker,
      startDate,
      activity: activity || [],
      uploads: uploads || [],
      reminders: reminders || []
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
  const { person, type, status, assignedCaseworker, startDate, activity, uploads, reminders } = req.body;
  try {
    await Case.findByIdAndUpdate(req.params.id, {
      person,
      type,
      status,
      assignedCaseworker,
      startDate,
      activity: activity || [],
      uploads: uploads || [],
      reminders: reminders || []
    });
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

// Upload a file for a case
const uploadCaseFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    // Return file info for use in uploads array
    res.json({
      name: req.file.originalname,
      url: req.file.path.replace('\\', '/'), // for Windows compatibility
      msg: 'File uploaded successfully',
    });
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
}; 