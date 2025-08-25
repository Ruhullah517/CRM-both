const EmailTemplate = require('../models/EmailTemplate');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const { sendMail, getFromAddress } = require('../utils/mailer');

// Helper to fill template placeholders
function fillTemplate(str, data) {
  return str.replace(/{{\s*([\w_\d]+)\s*}}/g, (match, key) => data[key] || '');
}

// Helper to add logo to email body
function addLogoToEmail(body, logoFile, templateId) {
  if (!logoFile) {
    return body;
  }
  
  // Check if logoFile is a base64 data URL
  const isBase64 = logoFile.startsWith('data:image/');
  
  let logoHtml;
  if (isBase64) {
    // For email compatibility, we need to host the image externally
    // Use template ID instead of passing full base64 data in URL
    const backendUrl = 'https://crm-backend-0v14.onrender.com';
    logoHtml = `<div style="text-align: start; margin-bottom: 20px;">
      <img src="${backendUrl}/api/email-templates/logo/template/${templateId}" alt="Logo" style="max-height: 60px; max-width: 200px; height: auto; width: auto;" />
    </div>`;
  } else {
    // Fallback for file paths (legacy support)
    const backendUrl = 'https://crm-backend-0v14.onrender.com';
    logoHtml = `<div style="text-align: start; margin-bottom: 20px;">
      <img src="${backendUrl}${logoFile}" alt="Logo" style="max-height: 60px; max-width: 200px; height: auto; width: auto;" />
    </div>`;
  }
  
  return logoHtml + body;
}



// Configure your transporter as per your SMTP settings
// Centralized transporter via utils/mailer

// POST /api/emails/bulk
async function sendBulkEmail(req, res) {
  const { templateId, recipients, subjectOverride, bodyOverride } = req.body;
  if (!templateId || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: 'templateId and recipients are required' });
  }
  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    // Template found, proceed with email sending
    
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
      body = addLogoToEmail(body, template.logoFile, template._id);
      
      // Prepare email options
      const mailOptions = {
        from: getFromAddress(),
        to: email,
        subject,
        html: body,
      };
      
      // No need for attachments since logo is embedded directly in HTML
      
      // Send email
      let status = 'sent', error = null;
      try {
        await sendMail(mailOptions);
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