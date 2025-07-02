const FormFSession = require('../models/FormFSession');

function toMysqlDate(val) {
  if (!val) return null;
  return val.split('T')[0];
}

// Get all Form F sessions for an enquiry
const getSessionsByEnquiryId = async (req, res) => {
  try {
    const sessions = await FormFSession.find({ enquiry_id: req.params.enquiryId }).sort('session_number');
    res.json(sessions);
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
      const filter = { enquiry_id: enquiryId, session_number: s.session_number };
      const update = {
        notes: s.notes,
        date: s.date ? new Date(s.date) : undefined,
        completed: s.completed,
        updated_at: new Date(),
      };
      await FormFSession.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
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