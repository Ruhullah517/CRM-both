const db = require('../config/db');

// List all mentors
const getAllMentors = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mentors');
    // Map created_at to dateAdded and parse skills/mentees
    const mapped = rows.map(m => ({
      ...m,
      dateAdded: m.created_at,
      skills: m.skills ? JSON.parse(m.skills) : [],
      mentees: m.mentees ? JSON.parse(m.mentees) : [],
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single mentor by ID
const getMentorById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mentors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Mentor not found' });
    const m = rows[0];
    res.json({
      ...m,
      dateAdded: m.created_at,
      skills: m.skills ? JSON.parse(m.skills) : [],
      mentees: m.mentees ? JSON.parse(m.mentees) : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new mentor
const createMentor = async (req, res) => {
  const { name, email, phone, skills, status, avatar, mentees } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO mentors (name, email, phone, skills, status, avatar, mentees) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, JSON.stringify(skills || []), status, avatar, JSON.stringify(mentees || [])]
    );
    res.status(201).json({ id: result.insertId, name, email, phone, skills, status, avatar, mentees });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a mentor
const updateMentor = async (req, res) => {
  const { name, email, phone, skills, status, avatar, mentees } = req.body;
  try {
    await db.query(
      'UPDATE mentors SET name = ?, email = ?, phone = ?, skills = ?, status = ?, avatar = ?, mentees = ? WHERE id = ?',
      [name, email, phone, JSON.stringify(skills || []), status, avatar, JSON.stringify(mentees || []), req.params.id]
    );
    res.json({ msg: 'Mentor updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a mentor
const deleteMentor = async (req, res) => {
  try {
    await db.query('DELETE FROM mentors WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Mentor deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
}; 