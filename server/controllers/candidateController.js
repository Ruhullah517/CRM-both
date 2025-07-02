const Candidate = require('../models/Candidate');

// List all candidates
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
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

// Create a new candidate
const createCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    const candidate = new Candidate({
      name,
      email,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline
    });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a candidate
const updateCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    await Candidate.findByIdAndUpdate(req.params.id, {
      name,
      email,
      mentor,
      status,
      stage,
      notes: notes || [],
      documents: documents || [],
      deadline
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

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
}; 