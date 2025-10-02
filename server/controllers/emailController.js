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
        console.log('Sending email to:', email);
        console.log('Email subject:', subject);
        console.log('Mail options:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          bodyLength: mailOptions.html?.length || 0
        });
        
        const result = await sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
      } catch (err) {
        console.error('Email sending failed:', err);
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

// Send individual email
async function sendIndividualEmail(req, res) {
  const { templateId, recipient, subjectOverride, bodyOverride, data = {} } = req.body;
  
  if (!templateId || !recipient?.email) {
    return res.status(400).json({ message: 'templateId and recipient email are required' });
  }
  
  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    // Fill subject/body with data
    const subject = subjectOverride ? fillTemplate(subjectOverride, data) : fillTemplate(template.subject, data);
    let body = bodyOverride ? fillTemplate(bodyOverride, data) : fillTemplate(template.body, data);
    
    // Add logo to email body if template has one
    body = addLogoToEmail(body, template.logoFile, template._id);
    
    // Prepare email options
    const mailOptions = {
      from: getFromAddress(),
      to: recipient.email,
      subject,
      html: body,
    };
    
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
      recipient: recipient.email,
      subject,
      body,
      template: template._id,
      status,
      error,
      sentAt: status === 'sent' ? new Date() : undefined,
    });
    await emailLog.save();
    
    res.json({ 
      message: 'Email sent successfully',
      status,
      error 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email sending failed', error: err.message });
  }
}

// Send email to contacts by tags
async function sendEmailToContactsByTags(req, res) {
  const { templateId, tags, subjectOverride, bodyOverride, data = {} } = req.body;
  
  if (!templateId || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ message: 'templateId and tags are required' });
  }
  
  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    // Find contacts with specified tags
    const contacts = await Contact.find({ 
      tags: { $in: tags },
      email: { $exists: true, $ne: '' }
    });
    
    if (contacts.length === 0) {
      return res.status(404).json({ message: 'No contacts found with specified tags' });
    }
    
    const results = [];
    for (const contact of contacts) {
      // Fill subject/body with contact data
      const contactData = {
        name: contact.name || '',
        email: contact.email || '',
        organization: contact.organizationName || '',
        ...data
      };
      
      const subject = subjectOverride ? fillTemplate(subjectOverride, contactData) : fillTemplate(template.subject, contactData);
      let body = bodyOverride ? fillTemplate(bodyOverride, contactData) : fillTemplate(template.body, contactData);
      
      // Add logo to email body if template has one
      body = addLogoToEmail(body, template.logoFile, template._id);
      
      // Prepare email options
      const mailOptions = {
        from: getFromAddress(),
        to: contact.email,
        subject,
        html: body,
      };
      
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
        recipient: contact.email,
        subject,
        body,
        template: template._id,
        status,
        error,
        sentAt: status === 'sent' ? new Date() : undefined,
      });
      await emailLog.save();
      
      results.push({ 
        email: contact.email, 
        name: contact.name,
        status, 
        error 
      });
    }
    
    res.json({ 
      message: `Emails sent to ${results.length} contacts`,
      results 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email sending failed', error: err.message });
  }
}

// Get email history
async function getEmailHistory(req, res) {
  try {
    const { page = 1, limit = 50, status, templateId } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (templateId) filter.template = templateId;
    
    const emails = await Email.find(filter)
      .populate('template', 'name subject')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Email.countDocuments(filter);
    
    res.json({
      emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch email history', error: err.message });
  }
}

// Get email statistics
async function getEmailStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    const match = {};
    if (startDate || endDate) {
      match.sentAt = {};
      if (startDate) match.sentAt.$gte = new Date(startDate);
      if (endDate) match.sentAt.$lte = new Date(endDate);
    }
    
    const stats = await Email.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalEmails = await Email.countDocuments(match);
    const sentEmails = await Email.countDocuments({ ...match, status: 'sent' });
    const failedEmails = await Email.countDocuments({ ...match, status: 'failed' });
    
    res.json({
      totalEmails,
      sentEmails,
      failedEmails,
      successRate: totalEmails > 0 ? ((sentEmails / totalEmails) * 100).toFixed(2) : 0,
      statusBreakdown: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch email statistics', error: err.message });
  }
}

// Preview email with template and data
async function previewEmail(req, res) {
  const { templateId, data = {} } = req.body;
  
  if (!templateId) {
    return res.status(400).json({ message: 'templateId is required' });
  }
  
  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    
    // Fill subject/body with data
    const subject = fillTemplate(template.subject, data);
    let body = fillTemplate(template.body, data);
    
    // Add logo to email body if template has one
    body = addLogoToEmail(body, template.logoFile, template._id);
    
    res.json({
      subject,
      body,
      template: {
        name: template.name,
        category: template.category
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to preview email', error: err.message });
  }
}

module.exports = { 
  sendBulkEmail,
  sendIndividualEmail,
  sendEmailToContactsByTags,
  getEmailHistory,
  getEmailStats,
  previewEmail
};