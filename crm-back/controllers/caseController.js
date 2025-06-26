const db = require('../config/db');

// List all cases
const getAllCases = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cases');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single case by ID
const getCaseById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cases WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Case not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new case
const createCase = async (req, res) => {
  const { person, type, status, assignedCaseworker, startDate, activity, uploads, reminders } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO cases (person, type, status, assignedCaseworker, startDate, activity, uploads, reminders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [person, type, status, assignedCaseworker, startDate, JSON.stringify(activity || []), JSON.stringify(uploads || []), JSON.stringify(reminders || [])]
    );
    res.status(201).json({ id: result.insertId, person, type, status, assignedCaseworker, startDate, activity, uploads, reminders });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a case
const updateCase = async (req, res) => {
  const { person, type, status, assignedCaseworker, startDate, activity, uploads, reminders } = req.body;
  try {
    await db.query(
      'UPDATE cases SET person = ?, type = ?, status = ?, assignedCaseworker = ?, startDate = ?, activity = ?, uploads = ?, reminders = ? WHERE id = ?',
      [person, type, status, assignedCaseworker, startDate, JSON.stringify(activity || []), JSON.stringify(uploads || []), JSON.stringify(reminders || []), req.params.id]
    );
    res.json({ msg: 'Case updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a case
const deleteCase = async (req, res) => {
  try {
    await db.query('DELETE FROM cases WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Case deleted' });
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
}; 