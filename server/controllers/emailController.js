const EmailTemplate = require('../models/EmailTemplate');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const { sendMail, getFromAddress } = require('../utils/mailer');
const { getEmailContainer } = require('../utils/emailTemplates');
const path = require('path');
const fs = require('fs');

// Helper to fill template placeholders
function fillTemplate(str, data) {
  return str.replace(/{{\s*([\w_\d]+)\s*}}/g, (match, key) => data[key] || '');
}

// Helper to get logo attachment for email (matching training/freelancer emails)
function getLogoAttachment() {
  // Use the company logo from the public folder (same as training/freelancer emails)
  const logoPath = path.join(__dirname, '..', '..', 'client', 'public', 'logo-white.png');
  
  // Check if logo exists, otherwise return null
  if (!fs.existsSync(logoPath)) {
    console.warn('Logo file not found at:', logoPath);
    return null;
  }
  
  // Use same CID as training/freelancer emails (company-logo, not email-logo)
  return {
    filename: 'logo-white.png',
    path: logoPath,
    cid: 'company-logo' // Same CID referenced in getEmailHeader()
  };
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
      
      // Wrap body in branded container (same as training/freelancer emails) - includes header with logo
      // For sales/communication emails, don't show "Training & Development Services" subheading
      body = getEmailContainer(body, false);
      
      // Prepare email options with logo attachment (always include logo, same as training/freelancer emails)
      const mailOptions = {
        from: getFromAddress(),
        to: email,
        subject,
        html: body,
        attachments: []
      };
      
      // Always add logo attachment (same as training/freelancer emails)
      const logoAttachment = getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments.push(logoAttachment);
      }
      
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
    
    // Wrap body in branded container (same as training/freelancer emails) - includes header with logo
    // For sales/communication emails, don't show "Training & Development Services" subheading
    body = getEmailContainer(body, false);
    
    // Prepare email options with logo attachment (always include logo, same as training/freelancer emails)
    const mailOptions = {
      from: getFromAddress(),
      to: recipient.email,
      subject,
      html: body,
      attachments: []
    };
    
    // Always add logo attachment (same as training/freelancer emails)
    const logoAttachment = getLogoAttachment();
    if (logoAttachment) {
      mailOptions.attachments.push(logoAttachment);
    }
    
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
      
      // Wrap body in branded container (same as training/freelancer emails) - includes header with logo
      // For sales/communication emails, don't show "Training & Development Services" subheading
      body = getEmailContainer(body, false);
      
      // Prepare email options with logo attachment (always include logo, same as training/freelancer emails)
      const mailOptions = {
        from: getFromAddress(),
        to: contact.email,
        subject,
        html: body,
        attachments: []
      };
      
      // Always add logo attachment (same as training/freelancer emails)
      const logoAttachment = getLogoAttachment();
      if (logoAttachment) {
        mailOptions.attachments.push(logoAttachment);
      }
      
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
      totalSent: sentEmails, // Add alias for frontend compatibility
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
    
    // Wrap body in branded container (same as training/freelancer emails) - includes header with logo
    // For sales/communication emails, don't show "Training & Development Services" subheading
    body = getEmailContainer(body, false);
    
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