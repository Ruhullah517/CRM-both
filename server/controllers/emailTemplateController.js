const EmailTemplate = require('../models/EmailTemplate');

// List all email templates
const getAllEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single email template by ID
const getEmailTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ msg: 'Email template not found' });
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new email template
const createEmailTemplate = async (req, res) => {
  const { name, subject, body, logoUrl, primaryColor, fontFamily, category } = req.body;
  try {
    const template = new EmailTemplate({ name, subject, body, logoUrl, primaryColor, fontFamily, category });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update an email template
const updateEmailTemplate = async (req, res) => {
  const { name, subject, body, logoUrl, primaryColor, fontFamily, category } = req.body;
  try {
    await EmailTemplate.findByIdAndUpdate(req.params.id, { name, subject, body, logoUrl, primaryColor, fontFamily, category });
    res.json({ msg: 'Email template updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete an email template
const deleteEmailTemplate = async (req, res) => {
  try {
    await EmailTemplate.findByIdAndDelete(req.params.id);
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