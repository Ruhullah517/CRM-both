const db = require('../config/db');

// List all candidates
const getAllCandidates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM candidates');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM candidates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Candidate not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new candidate
const createCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO candidates (name, email, mentor, status, stage, notes, documents, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, mentor, status, stage, JSON.stringify(notes || []), JSON.stringify(documents || []), deadline]
    );
    res.status(201).json({ id: result.insertId, name, email, mentor, status, stage, notes, documents, deadline });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a candidate
const updateCandidate = async (req, res) => {
  const { name, email, mentor, status, stage, notes, documents, deadline } = req.body;
  try {
    await db.query(
      'UPDATE candidates SET name = ?, email = ?, mentor = ?, status = ?, stage = ?, notes = ?, documents = ?, deadline = ? WHERE id = ?',
      [name, email, mentor, status, stage, JSON.stringify(notes || []), JSON.stringify(documents || []), deadline, req.params.id]
    );
    res.json({ msg: 'Candidate updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a candidate
const deleteCandidate = async (req, res) => {
  try {
    await db.query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
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