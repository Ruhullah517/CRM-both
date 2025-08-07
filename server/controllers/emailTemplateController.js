const EmailTemplate = require('../models/EmailTemplate');
const fs = require('fs');
const path = require('path');

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

// Migration function to convert existing file paths to base64
const migrateTemplatesToBase64 = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({ logoFile: { $exists: true, $ne: null } });
    let updatedCount = 0;
    
    for (const template of templates) {
      // Skip if already base64
      if (template.logoFile && template.logoFile.startsWith('data:image/')) {
        continue;
      }
      
      // Skip if no logo file
      if (!template.logoFile || !template.logoFile.startsWith('/uploads/')) {
        continue;
      }
      
      // Try to convert file path to base64
      const filePath = path.join(__dirname, '..', template.logoFile);
      if (fs.existsSync(filePath)) {
        const base64Data = fileToBase64(filePath);
        if (base64Data) {
          template.logoFile = base64Data;
          await template.save();
          updatedCount++;
          
          // Clean up the old file
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting old file:', err);
          }
        }
      }
    }
    
    res.json({ 
      message: `Migration completed. ${updatedCount} templates updated.`,
      updatedCount 
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
};

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

// Debug function to check template data
const debugTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    const debugData = templates.map(t => ({
      id: t._id,
      name: t.name,
      logoFile: t.logoFile ? (t.logoFile.startsWith('data:') ? 'BASE64_DATA' : t.logoFile) : 'NULL',
      logoFileName: t.logoFileName,
      hasLogoFile: !!t.logoFile,
      logoFileLength: t.logoFile ? t.logoFile.length : 0
    }));
    
    res.json({
      totalTemplates: templates.length,
      templates: debugData
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Debug failed', error: error.message });
  }
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  migrateTemplatesToBase64,
  debugTemplates
}; 