const db = require('../config/db');

// List all email templates
const getAllEmailTemplates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_templates');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single email template by ID
const getEmailTemplateById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM email_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Email template not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new email template
const createEmailTemplate = async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO email_templates (name, subject, body) VALUES (?, ?, ?)',
      [name, subject, body]
    );
    res.status(201).json({ id: result.insertId, name, subject, body });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update an email template
const updateEmailTemplate = async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    await db.query(
      'UPDATE email_templates SET name = ?, subject = ?, body = ? WHERE id = ?',
      [name, subject, body, req.params.id]
    );
    res.json({ msg: 'Email template updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete an email template
const deleteEmailTemplate = async (req, res) => {
  try {
    await db.query('DELETE FROM email_templates WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Email template deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
}; 