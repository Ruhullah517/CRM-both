const db = require('../config/db');

function toMysqlDate(val) {
  if (!val) return null;
  return val.split('T')[0];
}

// Get all Form F sessions for an enquiry
const getSessionsByEnquiryId = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM formf_sessions WHERE enquiry_id = ? ORDER BY session_number', [req.params.enquiryId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Upsert (create or update) sessions for an enquiry
const upsertSessions = async (req, res) => {
  const { enquiryId } = req.params;
  const { sessions } = req.body; // sessions: [{session_number, notes, date, completed}]
  if (!Array.isArray(sessions)) return res.status(400).json({ msg: 'Sessions must be an array' });
  try {
    for (const s of sessions) {
      const dateValue = toMysqlDate(s.date);
      // Try update first
      const [result] = await db.query(
        'UPDATE formf_sessions SET notes = ?, date = ?, completed = ? WHERE enquiry_id = ? AND session_number = ?',
        [s.notes, dateValue, s.completed, enquiryId, s.session_number]
      );
      if (result.affectedRows === 0) {
        // Insert if not exists
        await db.query(
          'INSERT INTO formf_sessions (enquiry_id, session_number, notes, date, completed) VALUES (?, ?, ?, ?, ?)',
          [enquiryId, s.session_number, s.notes, dateValue, s.completed]
        );
      }
    }
    res.json({ msg: 'Sessions upserted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getSessionsByEnquiryId,
  upsertSessions,
}; 