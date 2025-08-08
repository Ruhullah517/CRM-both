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

// Test function to verify base64 data and create test HTML
const testTemplateLogo = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await EmailTemplate.findById(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const testHtml = `
      <html>
        <head>
          <title>Logo Test</title>
        </head>
        <body>
          <h1>Logo Test for Template: ${template.name}</h1>
          <div>
            <h2>Logo Data Info:</h2>
            <p>Has logo: ${!!template.logoFile}</p>
            <p>Logo length: ${template.logoFile ? template.logoFile.length : 0}</p>
            <p>Is base64: ${template.logoFile ? template.logoFile.startsWith('data:image/') : false}</p>
            <p>Logo prefix: ${template.logoFile ? template.logoFile.substring(0, 50) : 'N/A'}</p>
          </div>
          <div>
            <h2>Logo Display:</h2>
            ${template.logoFile ? `<img src="${template.logoFile}" alt="Logo" style="max-height: 100px; max-width: 300px; border: 1px solid #ccc;" />` : '<p>No logo</p>'}
          </div>
          <div>
            <h2>Full Logo Data (first 200 chars):</h2>
            <pre style="background: #f0f0f0; padding: 10px; overflow-x: auto;">${template.logoFile ? template.logoFile.substring(0, 200) + '...' : 'No logo data'}</pre>
          </div>
        </body>
      </html>
    `;
    
    res.send(testHtml);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
};

// Serve logo images for email templates by template ID
const serveLogoByTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    if (!templateId) {
      return res.status(400).json({ message: 'Template ID is required' });
    }
    
    console.log('Logo request for template:', templateId);
    
    // Find the template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    if (!template.logoFile) {
      return res.status(404).json({ message: 'No logo found for this template' });
    }
    
    console.log('Template found, logo length:', template.logoFile.length);
    
    // Check if logoFile is base64
    if (template.logoFile.startsWith('data:image/')) {
      // Extract the base64 data from the data URL
      const base64Match = template.logoFile.match(/data:image\/([^;]+);base64,(.+)/);
      if (!base64Match) {
        return res.status(400).json({ message: 'Invalid logo data format' });
      }
      
      const mimeType = base64Match[1];
      const base64Data = base64Match[2];
      
      console.log('MIME type:', mimeType);
      console.log('Base64 data length:', base64Data.length);
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      console.log('Image buffer length:', imageBuffer.length);
      
      // Set appropriate headers
      res.setHeader('Content-Type', `image/${mimeType}`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Send the image
      res.send(imageBuffer);
    } else {
      // Fallback for file paths
      return res.status(400).json({ message: 'Logo format not supported' });
    }
    
  } catch (error) {
    console.error('Logo serve error:', error);
    res.status(500).json({ message: 'Failed to serve logo', error: error.message });
  }
};

// Serve logo images for email templates (legacy route)
const serveLogo = async (req, res) => {
  try {
    const { encodedLogo } = req.params;
    
    if (!encodedLogo) {
      return res.status(400).json({ message: 'Logo parameter is required' });
    }
    
    console.log('Logo request received:', {
      encodedLogoLength: encodedLogo.length,
      encodedLogoPrefix: encodedLogo.substring(0, 50)
    });
    
    // URL decode the parameter first
    const decodedLogo = decodeURIComponent(encodedLogo);
    
    console.log('Decoded logo length:', decodedLogo.length);
    
    // Decode the base64 logo data
    const logoData = Buffer.from(decodedLogo, 'base64').toString();
    
    console.log('Logo data length:', logoData.length);
    console.log('Logo data prefix:', logoData.substring(0, 50));
    
    // Extract the base64 data from the data URL
    const base64Match = logoData.match(/data:image\/([^;]+);base64,(.+)/);
    if (!base64Match) {
      console.log('No base64 match found');
      return res.status(400).json({ message: 'Invalid logo data format' });
    }
    
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    
    console.log('MIME type:', mimeType);
    console.log('Base64 data length:', base64Data.length);
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('Image buffer length:', imageBuffer.length);
    
    // Set appropriate headers
    res.setHeader('Content-Type', `image/${mimeType}`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send the image
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Logo serve error:', error);
    res.status(500).json({ message: 'Failed to serve logo', error: error.message });
  }
};

module.exports = {
  getAllEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  migrateTemplatesToBase64,
  debugTemplates,
  testTemplateLogo,
  serveLogo,
  serveLogoByTemplate
}; 