const EmailTemplate = require('../models/EmailTemplate');
const Email = require('../models/Email');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Helper to fill template placeholders
function fillTemplate(str, data) {
  return str.replace(/{{\s*([\w_\d]+)\s*}}/g, (match, key) => data[key] || '');
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
    const results = [];
    for (const recipient of recipients) {
      const { email, data = {} } = recipient;
      if (!email) {
        results.push({ email: null, status: 'failed', error: 'Missing email' });
        continue;
      }
      // Fill subject/body
      const subject = subjectOverride ? fillTemplate(subjectOverride, data) : fillTemplate(template.subject, data);
      const body = bodyOverride ? fillTemplate(bodyOverride, data) : fillTemplate(template.body, data);
      // Send email
      let status = 'sent', error = null;
      try {
        await transporter.sendMail({
          from: 'ruhullah517@gmail.com',
          to: email,
          subject,
          html: body,
        });
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