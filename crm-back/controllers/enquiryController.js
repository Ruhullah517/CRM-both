const db = require('../config/db');

// List all enquiries
const getAllEnquiries = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enquiries');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single enquiry by ID
const getEnquiryById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Enquiry not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Approve an enquiry
const approveEnquiry = async (req, res) => {
  try {
    await db.query('UPDATE enquiries SET status = ? WHERE id = ?', ['Approved', req.params.id]);
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
    await db.query('UPDATE enquiries SET status = ?, rejection_reason = ? WHERE id = ?', ['Rejected', reason, req.params.id]);
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
    await db.query('UPDATE enquiries SET assigned_to = ? WHERE id = ?', [staffId, req.params.id]);
    res.json({ msg: 'Enquiry assigned' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllEnquiries,
  getEnquiryById,
  approveEnquiry,
  rejectEnquiry,
  assignEnquiry,
}; 