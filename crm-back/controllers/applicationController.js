const db = require('../config/db');

const uploadApplication = async (req, res) => {
  const { enquiryId } = req.body;
  const filePath = req.file.path;

  try {
    // Check if an application for this enquiry already exists
    const [existing] = await db.query('SELECT * FROM applications WHERE enquiry_id = ?', [enquiryId]);

    if (existing.length > 0) {
      // Update existing application
      await db.query('UPDATE applications SET application_form_path = ?, status = ? WHERE enquiry_id = ?', [filePath, 'Uploaded', enquiryId]);
    } else {
      // Insert new application
      await db.query('INSERT INTO applications (enquiry_id, application_form_path, status) VALUES (?, ?, ?)', [enquiryId, filePath, 'Uploaded']);
    }

    res.json({
      msg: 'File uploaded successfully',
      filePath: filePath,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const getApplicationByEnquiryId = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM applications WHERE enquiry_id = ?', [req.params.enquiryId]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Application not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  uploadApplication,
  getApplicationByEnquiryId,
}; 