const db = require('../config/db');

// Create a new assessment
const createAssessment = async (req, res) => {
  const { enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO initial_assessments (enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status) VALUES (?, ?, ?, ?, ?, ?)',
      [enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status || 'Pending']
    );
    res.status(201).json({ id: result.insertId, enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status: status || 'Pending' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get assessment by enquiry ID
const getAssessmentByEnquiryId = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM initial_assessments WHERE enquiry_id = ?', [req.params.enquiryId]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Assessment not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createAssessment,
  getAssessmentByEnquiryId,
}; 