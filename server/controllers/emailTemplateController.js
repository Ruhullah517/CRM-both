const EmailTemplate = require('../models/EmailTemplate');
const fs = require('fs');

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

// Helper function to convert file to base64
function fileToBase64(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString('base64');
    
    // Detect MIME type based on file extension
    const ext = filePath.split('.').pop().toLowerCase();
    let mimeType = 'image/png'; // default
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/png';
    }
    
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    return null;
  }
}

// Create a new email template
const createEmailTemplate = async (req, res) => {
  const { name, subject, body, primaryColor, fontFamily, category } = req.body;
  try {
    let logoFile = null;
    let logoFileName = null;
    
    if (req.file) {
      // Convert uploaded file to base64 for database storage
      const base64Data = fileToBase64(req.file.path);
      if (base64Data) {
        logoFile = base64Data;
        logoFileName = req.file.originalname;
        
        // Clean up the temporary file
        fs.unlinkSync(req.file.path);
      }
    }
    
    const template = new EmailTemplate({ 
      name, 
      subject, 
      body, 
      logoFile, 
      logoFileName, 
      primaryColor, 
      fontFamily, 
      category 
    });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update an email template
const updateEmailTemplate = async (req, res) => {
  const { name, subject, body, primaryColor, fontFamily, category } = req.body;
  try {
    let logoFile = null;
    let logoFileName = null;
    
    if (req.file) {
      // Convert uploaded file to base64 for database storage
      const base64Data = fileToBase64(req.file.path);
      if (base64Data) {
        logoFile = base64Data;
        logoFileName = req.file.originalname;
        
        // Clean up the temporary file
        fs.unlinkSync(req.file.path);
      }
    }
    
    const updateData = { 
      name, 
      subject, 
      body, 
      primaryColor, 
      fontFamily, 
      category 
    };
    
    if (logoFile) {
      updateData.logoFile = logoFile;
      updateData.logoFileName = logoFileName;
    }
    
    await EmailTemplate.findByIdAndUpdate(req.params.id, updateData);
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
  deleteEmailTemplate
}; 