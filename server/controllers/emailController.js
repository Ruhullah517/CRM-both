const EmailTemplate = require('../models/EmailTemplate');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Helper to fill template placeholders
function fillTemplate(str, data) {
  return str.replace(/{{\s*([\w_\d]+)\s*}}/g, (match, key) => data[key] || '');
}

// Helper to add logo to email body
function addLogoToEmail(body, logoFile) {
  console.log('addLogoToEmail called with logoFile:', logoFile ? logoFile.substring(0, 100) + '...' : 'null/undefined');
  console.log('logoFile type:', typeof logoFile);
  console.log('logoFile length:', logoFile ? logoFile.length : 'null/undefined');
  
  if (!logoFile) {
    console.log('No logo file provided, returning body as-is');
    return body;
  }
  
  // Check if logoFile is a base64 data URL or a file path
  const isBase64 = logoFile.startsWith('data:image/');
  console.log('Is base64:', isBase64);
  console.log('Base64 prefix check:', logoFile.substring(0, 30));
  
  let logoHtml;
  if (isBase64) {
    // Use embedded image with CID for email clients
    logoHtml = `<div style="text-align: start; margin-bottom: 20px;">
      <img src="cid:logo" alt="Logo" style="max-height: 60px; max-width: 200px; height: auto; width: auto;" />
    </div>`;
    console.log('Generated embedded logo HTML length:', logoHtml.length);
  } else {
    // Fallback for file paths (legacy support)
    const backendUrl = 'https://crm-backend-0v14.onrender.com';
    logoHtml = `<div style="text-align: start; margin-bottom: 20px;">
      <img src="${backendUrl}${logoFile}" alt="Logo" style="max-height: 60px; max-width: 200px; height: auto; width: auto;" />
    </div>`;
    console.log('Generated file path logo HTML length:', logoHtml.length);
  }
  
  console.log('Final logo HTML preview:', logoHtml.substring(0, 200) + '...');
  return logoHtml + body;
}

// Helper to convert base64 to buffer
function base64ToBuffer(base64String) {
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string');
  }
  return Buffer.from(matches[2], 'base64');
}

// Configure your transporter as per your SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ruhullah517@gmail.com',
    pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
  }
});

// POST /api/emails/bulk
async function sendBulkEmail(req, res) {
  const { templateId, recipients, subjectOverride, bodyOverride } = req.body;
  if (!templateId || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: 'templateId and recipients are required' });
  }
  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    console.log('Template found:', {
      id: template._id,
      name: template.name,
      logoFile: template.logoFile,
      logoFileName: template.logoFileName
    });
    
    const results = [];
    for (const recipient of recipients) {
      const { email, data = {} } = recipient;
      if (!email) {
        results.push({ email: null, status: 'failed', error: 'Missing email' });
        continue;
      }
      // Fill subject/body
      const subject = subjectOverride ? fillTemplate(subjectOverride, data) : fillTemplate(template.subject, data);
      let body = bodyOverride ? fillTemplate(bodyOverride, data) : fillTemplate(template.body, data);
      
      // Add logo to email body if template has one
      body = addLogoToEmail(body, template.logoFile);
      
      // Prepare email options
      const mailOptions = {
        from: 'ruhullah517@gmail.com',
        to: email,
        subject,
        html: body,
      };
      
      // Add embedded image if template has base64 logo
      if (template.logoFile && template.logoFile.startsWith('data:image/')) {
        try {
          const logoBuffer = base64ToBuffer(template.logoFile);
          mailOptions.attachments = [{
            filename: template.logoFileName || 'logo.png',
            content: logoBuffer,
            cid: 'logo'
          }];
        } catch (err) {
          console.error('Error converting base64 to buffer:', err);
        }
      }
      
      // Send email
      let status = 'sent', error = null;
      try {
        await transporter.sendMail(mailOptions);
      } catch (err) {
        status = 'failed';
        error = err.message;
      }
      // Log to Email model
      const emailLog = new Email({
        recipient: email,
        subject,
        body,
        template: template._id,
        status,
        error,
        sentAt: status === 'sent' ? new Date() : undefined,
      });
      await emailLog.save();
      results.push({ email, status, error });
    }
    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Bulk email failed', error: err.message });
  }
}

module.exports = { sendBulkEmail };