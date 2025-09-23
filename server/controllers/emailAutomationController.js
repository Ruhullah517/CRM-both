const EmailAutomation = require('../models/EmailAutomation');
const EmailAutomationLog = require('../models/EmailAutomationLog');
const EmailTemplate = require('../models/EmailTemplate');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

// Get all automations
const getAllAutomations = async (req, res) => {
  try {
    const automations = await EmailAutomation.find()
      .populate('emailTemplate', 'name subject')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
};

// Get automation by ID
const getAutomationById = async (req, res) => {
  try {
    const automation = await EmailAutomation.findById(req.params.id)
      .populate('emailTemplate')
      .populate('createdBy', 'name email');
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    res.json(automation);
  } catch (error) {
    console.error('Error fetching automation:', error);
    res.status(500).json({ error: 'Failed to fetch automation' });
  }
};

// Create new automation
const createAutomation = async (req, res) => {
  try {
    const automationData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const automation = new EmailAutomation(automationData);
    await automation.save();
    
    await automation.populate('emailTemplate', 'name subject');
    await automation.populate('createdBy', 'name email');
    
    res.status(201).json(automation);
  } catch (error) {
    console.error('Error creating automation:', error);
    res.status(500).json({ error: 'Failed to create automation' });
  }
};

// Update automation
const updateAutomation = async (req, res) => {
  try {
    const automation = await EmailAutomation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('emailTemplate', 'name subject')
      .populate('createdBy', 'name email');
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    res.json(automation);
  } catch (error) {
    console.error('Error updating automation:', error);
    res.status(500).json({ error: 'Failed to update automation' });
  }
};

// Delete automation
const deleteAutomation = async (req, res) => {
  try {
    const automation = await EmailAutomation.findByIdAndDelete(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    // Also delete related logs
    await EmailAutomationLog.deleteMany({ automationId: req.params.id });
    
    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('Error deleting automation:', error);
    res.status(500).json({ error: 'Failed to delete automation' });
  }
};

// Toggle automation active status
const toggleAutomation = async (req, res) => {
  try {
    const automation = await EmailAutomation.findById(req.params.id);
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    automation.isActive = !automation.isActive;
    await automation.save();
    
    res.json(automation);
  } catch (error) {
    console.error('Error toggling automation:', error);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
};

// Get automation logs
const getAutomationLogs = async (req, res) => {
  try {
    const { automationId, page = 1, limit = 20, status } = req.query;
    
    const query = {};
    if (automationId) query.automationId = automationId;
    if (status) query.emailStatus = status;
    
    const logs = await EmailAutomationLog.find(query)
      .populate('automationId', 'name triggerType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await EmailAutomationLog.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({ error: 'Failed to fetch automation logs' });
  }
};

// Test automation (send test email)
const testAutomation = async (req, res) => {
  try {
    const { testEmail } = req.body;
    const automation = await EmailAutomation.findById(req.params.id)
      .populate('emailTemplate');
    
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }
    
    if (!automation.emailTemplate) {
      return res.status(400).json({ error: 'Email template not found' });
    }
    
    // Create test data
    const testData = {
      contactName: 'Test Contact',
      contactEmail: testEmail,
      organizationName: 'Test Organization',
      // Add more test data as needed
    };
    
    // Fill template with test data
    const filledSubject = fillTemplate(automation.emailTemplate.subject, testData);
    const filledBody = fillTemplate(automation.emailTemplate.body, testData);
    
    // Send test email
    const mailOptions = {
      to: testEmail,
      subject: filledSubject,
      html: filledBody
    };
    
    await sendMail(mailOptions);
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
};

// Helper function to fill template with data
const fillTemplate = (template, data) => {
  let filled = template;
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    filled = filled.replace(new RegExp(placeholder, 'g'), data[key] || '');
  });
  return filled;
};

// Process automation trigger (called by other controllers)
const processAutomationTrigger = async (triggerType, entityType, entityId, entityData) => {
  try {
    const automations = await EmailAutomation.find({
      isActive: true,
      triggerType: triggerType
    }).populate('emailTemplate');
    
    for (const automation of automations) {
      // Check if conditions are met
      if (await checkTriggerConditions(automation, entityData)) {
        // Calculate delay
        const scheduledFor = calculateDelay(automation.delay);
        
        // Get recipients
        const recipients = await getRecipients(automation, entityData);
        
        // Create automation logs for each recipient
        for (const recipient of recipients) {
          const log = new EmailAutomationLog({
            automationId: automation._id,
            triggerType: triggerType,
            triggerEntityType: entityType,
            triggerEntityId: entityId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            emailSubject: automation.emailTemplate.subject,
            scheduledFor: scheduledFor
          });
          
          await log.save();
          
          // Send email immediately if no delay, otherwise schedule it
          if (automation.delay.type === 'immediate') {
            await sendAutomationEmail(automation, recipient, entityData, log._id);
          }
        }
        
        // Update automation stats
        automation.lastTriggered = new Date();
        automation.triggerCount += 1;
        await automation.save();
      }
    }
  } catch (error) {
    console.error('Error processing automation trigger:', error);
  }
};

// Check if trigger conditions are met
const checkTriggerConditions = async (automation, entityData) => {
  const conditions = automation.triggerConditions;
  
  if (!conditions.field) return true; // No conditions = always trigger
  
  const fieldValue = getNestedValue(entityData, conditions.field);
  const conditionMet = evaluateCondition(fieldValue, conditions.operator, conditions.value);
  
  if (!conditionMet) return false;
  
  // Check additional conditions
  if (conditions.additionalConditions && conditions.additionalConditions.length > 0) {
    for (const additionalCondition of conditions.additionalConditions) {
      const additionalFieldValue = getNestedValue(entityData, additionalCondition.field);
      const additionalConditionMet = evaluateCondition(
        additionalFieldValue, 
        additionalCondition.operator, 
        additionalCondition.value
      );
      
      if (additionalCondition.logic === 'AND' && !additionalConditionMet) {
        return false;
      } else if (additionalCondition.logic === 'OR' && additionalConditionMet) {
        return true;
      }
    }
  }
  
  return true;
};

// Get nested value from object
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Evaluate condition
const evaluateCondition = (fieldValue, operator, expectedValue) => {
  switch (operator) {
    case 'equals':
      return fieldValue === expectedValue;
    case 'not_equals':
      return fieldValue !== expectedValue;
    case 'contains':
      return String(fieldValue).includes(String(expectedValue));
    case 'greater_than':
      return Number(fieldValue) > Number(expectedValue);
    case 'less_than':
      return Number(fieldValue) < Number(expectedValue);
    case 'is_empty':
      return !fieldValue || fieldValue === '';
    case 'is_not_empty':
      return fieldValue && fieldValue !== '';
    default:
      return false;
  }
};

// Calculate delay
const calculateDelay = (delay) => {
  const now = new Date();
  
  switch (delay.type) {
    case 'immediate':
      return now;
    case 'minutes':
      return new Date(now.getTime() + delay.value * 60 * 1000);
    case 'hours':
      return new Date(now.getTime() + delay.value * 60 * 60 * 1000);
    case 'days':
      return new Date(now.getTime() + delay.value * 24 * 60 * 60 * 1000);
    case 'weeks':
      return new Date(now.getTime() + delay.value * 7 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
};

// Get recipients based on automation config
const getRecipients = async (automation, entityData) => {
  const recipients = [];
  
  switch (automation.recipientType) {
    case 'contact':
      if (entityData.email) {
        recipients.push({
          email: entityData.email,
          name: entityData.name || entityData.full_name
        });
      }
      break;
      
    case 'user':
      const users = await User.find({ role: automation.recipientConfig.userRole });
      recipients.push(...users.map(user => ({
        email: user.email,
        name: user.name
      })));
      break;
      
    case 'all_contacts':
      const allContacts = await Contact.find({ status: 'active' });
      recipients.push(...allContacts.map(contact => ({
        email: contact.email,
        name: contact.name
      })));
      break;
      
    case 'contacts_by_tag':
      const tagContacts = await Contact.find({
        status: 'active',
        tags: { $in: automation.recipientConfig.tagFilters }
      });
      recipients.push(...tagContacts.map(contact => ({
        email: contact.email,
        name: contact.name
      })));
      break;
      
    case 'contacts_by_type':
      const typeContacts = await Contact.find({
        status: 'active',
        contactType: { $in: automation.recipientConfig.typeFilters }
      });
      recipients.push(...typeContacts.map(contact => ({
        email: contact.email,
        name: contact.name
      })));
      break;
      
    case 'custom':
      recipients.push(...automation.recipientConfig.customEmails.map(email => ({
        email: email,
        name: email
      })));
      break;
  }
  
  return recipients;
};

// Send automation email
const sendAutomationEmail = async (automation, recipient, entityData, logId) => {
  try {
    const template = automation.emailTemplate;
    const filledSubject = fillTemplate(template.subject, { ...entityData, ...recipient });
    const filledBody = fillTemplate(template.body, { ...entityData, ...recipient });
    
    const mailOptions = {
      to: recipient.email,
      subject: filledSubject,
      html: filledBody
    };
    
    await sendMail(mailOptions);
    
    // Update log
    await EmailAutomationLog.findByIdAndUpdate(logId, {
      emailStatus: 'sent',
      sentAt: new Date()
    });
    
  } catch (error) {
    console.error('Error sending automation email:', error);
    
    // Update log with error
    await EmailAutomationLog.findByIdAndUpdate(logId, {
      emailStatus: 'failed',
      errorMessage: error.message
    });
  }
};

module.exports = {
  getAllAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  getAutomationLogs,
  testAutomation,
  processAutomationTrigger
};
