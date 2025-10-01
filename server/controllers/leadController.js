const Contact = require('../models/Contact');
const { processAutomationTrigger } = require('./emailAutomationController');

// Capture contact form submission
const captureContactFormLead = async (req, res) => {
  try {
    const { 
      name, email, phone, message, subject, companyName, 
      tags, interests, source 
    } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    // Prepare tags - include WordPress form tags if provided
    const contactTags = ['website_lead', 'contact_form'];
    if (tags && Array.isArray(tags)) {
      // Add tags from WordPress form (e.g., from dropdown or checkboxes)
      tags.forEach(tag => {
        if (tag && !contactTags.includes(tag)) {
          contactTags.push(tag);
        }
      });
    }
    
    // Prepare interest areas - from WordPress form if provided
    const interestAreas = [];
    if (interests && Array.isArray(interests)) {
      interests.forEach(interest => {
        if (interest && !interestAreas.includes(interest)) {
          interestAreas.push(interest);
        }
      });
    }
    
    // Check if contact already exists
    let contact = await Contact.findOne({ email });
    
    if (contact) {
      // Update existing contact
      contact.name = name;
      contact.phone = phone || contact.phone;
      contact.organizationName = companyName || contact.organizationName;
      contact.notes = contact.notes 
        ? `${contact.notes}\n\n[${new Date().toISOString()}] Contact Form: ${message || subject || 'No message'}`
        : `[${new Date().toISOString()}] Contact Form: ${message || subject || 'No message'}`;
      
      // Add communication history
      contact.communicationHistory.push({
        type: 'form_submission',
        date: new Date(),
        summary: `Contact form submitted: ${subject || 'General inquiry'}`,
        engagement: {
          opened: false,
          clicked: false,
          bounced: false
        }
      });
      
      // Update tags - add new ones from form
      contactTags.forEach(tag => {
        if (!contact.tags.includes(tag)) {
          contact.tags.push(tag);
        }
      });
      
      // Update interest areas - add new ones from form
      interestAreas.forEach(interest => {
        if (!contact.interestAreas.includes(interest)) {
          contact.interestAreas.push(interest);
        }
      });
      
      contact.lastContactDate = new Date();
      contact.leadScore = Math.min(100, contact.leadScore + 10); // Increase lead score
      
      await contact.save();
      
      // Trigger automation for contact updated
      await processAutomationTrigger('contact_updated', 'contact', contact._id, contact.toObject());
    } else {
      // Create new contact
      contact = new Contact({
        name,
        email,
        phone: phone || '',
        organizationName: companyName || '',
        contactType: 'prospect',
        leadSource: source || 'website',
        status: 'active',
        tags: contactTags,
        interestAreas: interestAreas,
        notes: `[${new Date().toISOString()}] Contact Form: ${message || subject || 'No message'}`,
        communicationHistory: [
          {
            type: 'form_submission',
            date: new Date(),
            summary: `Contact form submitted: ${subject || 'General inquiry'}`,
            engagement: {
              opened: false,
              clicked: false,
              bounced: false
            }
          }
        ],
        emailPreferences: {
          marketing: true,
          training: true,
          newsletters: true,
          updates: true
        },
        leadScore: 20, // Initial score for contact form submission
        lastContactDate: new Date()
      });
      
      await contact.save();
      
      // Trigger automation for contact created
      await processAutomationTrigger('contact_created', 'contact', contact._id, contact.toObject());
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Error capturing contact form lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your request. Please try again later.' 
    });
  }
};

// Capture newsletter subscription
const captureSubscriberLead = async (req, res) => {
  try {
    const { email, name, source, tags, interests } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Prepare tags - include WordPress form tags if provided
    const contactTags = ['website_lead', 'newsletter_subscriber'];
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        if (tag && !contactTags.includes(tag)) {
          contactTags.push(tag);
        }
      });
    }
    
    // Prepare interest areas - from WordPress form if provided
    const interestAreas = [];
    if (interests && Array.isArray(interests)) {
      interests.forEach(interest => {
        if (interest && !interestAreas.includes(interest)) {
          interestAreas.push(interest);
        }
      });
    }
    
    // Check if contact already exists
    let contact = await Contact.findOne({ email });
    
    if (contact) {
      // Update existing contact
      if (name && !contact.name) {
        contact.name = name;
      }
      
      // Add communication history
      contact.communicationHistory.push({
        type: 'subscription',
        date: new Date(),
        summary: `Subscribed to newsletter via ${source || 'website'}`,
        engagement: {
          opened: false,
          clicked: false,
          bounced: false
        }
      });
      
      // Update tags - add new ones from form
      contactTags.forEach(tag => {
        if (!contact.tags.includes(tag)) {
          contact.tags.push(tag);
        }
      });
      
      // Update interest areas - add new ones from form
      interestAreas.forEach(interest => {
        if (!contact.interestAreas.includes(interest)) {
          contact.interestAreas.push(interest);
        }
      });
      
      contact.lastContactDate = new Date();
      contact.emailPreferences.newsletters = true;
      contact.leadScore = Math.min(100, contact.leadScore + 5); // Small increase for subscription
      
      await contact.save();
      
      // Trigger automation for contact updated
      await processAutomationTrigger('contact_updated', 'contact', contact._id, contact.toObject());
    } else {
      // Create new contact
      contact = new Contact({
        name: name || 'Newsletter Subscriber',
        email,
        contactType: 'prospect',
        leadSource: source || 'website',
        status: 'active',
        tags: contactTags,
        interestAreas: interestAreas,
        notes: `[${new Date().toISOString()}] Subscribed to newsletter`,
        communicationHistory: [
          {
            type: 'subscription',
            date: new Date(),
            summary: `Subscribed to newsletter via ${source || 'website'}`,
            engagement: {
              opened: false,
              clicked: false,
              bounced: false
            }
          }
        ],
        emailPreferences: {
          marketing: true,
          training: true,
          newsletters: true,
          updates: true
        },
        leadScore: 10, // Initial score for newsletter subscription
        lastContactDate: new Date()
      });
      
      await contact.save();
      
      // Trigger automation for contact created
      await processAutomationTrigger('contact_created', 'contact', contact._id, contact.toObject());
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for subscribing! Check your email for confirmation.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Error capturing subscriber lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your subscription. Please try again later.' 
    });
  }
};

// Capture training interest
const captureTrainingInterestLead = async (req, res) => {
  try {
    const { name, email, phone, trainingType, preferredDate, message } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    // Check if contact already exists
    let contact = await Contact.findOne({ email });
    
    if (contact) {
      // Update existing contact
      contact.name = name;
      contact.phone = phone || contact.phone;
      
      // Add interest area if not present
      if (!contact.interestAreas.includes('training')) {
        contact.interestAreas.push('training');
      }
      
      // Add tags
      if (!contact.tags.includes('training_interest')) {
        contact.tags.push('training_interest');
      }
      if (!contact.tags.includes('website_lead')) {
        contact.tags.push('website_lead');
      }
      
      // Add communication history
      contact.communicationHistory.push({
        type: 'form_submission',
        date: new Date(),
        summary: `Expressed interest in training: ${trainingType || 'General'}`,
        engagement: {
          opened: false,
          clicked: false,
          bounced: false
        }
      });
      
      contact.notes = contact.notes 
        ? `${contact.notes}\n\n[${new Date().toISOString()}] Training Interest: ${trainingType || 'General'}\nPreferred Date: ${preferredDate || 'Not specified'}\n${message || ''}`
        : `[${new Date().toISOString()}] Training Interest: ${trainingType || 'General'}\nPreferred Date: ${preferredDate || 'Not specified'}\n${message || ''}`;
      
      contact.lastContactDate = new Date();
      contact.leadScore = Math.min(100, contact.leadScore + 15); // Higher score for specific interest
      
      await contact.save();
      
      await processAutomationTrigger('contact_updated', 'contact', contact._id, contact.toObject());
    } else {
      // Create new contact
      contact = new Contact({
        name,
        email,
        phone: phone || '',
        contactType: 'prospect',
        leadSource: 'website',
        status: 'active',
        tags: ['website_lead', 'training_interest'],
        interestAreas: ['training'],
        notes: `[${new Date().toISOString()}] Training Interest: ${trainingType || 'General'}\nPreferred Date: ${preferredDate || 'Not specified'}\n${message || ''}`,
        communicationHistory: [
          {
            type: 'form_submission',
            date: new Date(),
            summary: `Expressed interest in training: ${trainingType || 'General'}`,
            engagement: {
              opened: false,
              clicked: false,
              bounced: false
            }
          }
        ],
        emailPreferences: {
          marketing: true,
          training: true,
          newsletters: true,
          updates: true
        },
        leadScore: 25, // Higher initial score for training interest
        lastContactDate: new Date()
      });
      
      await contact.save();
      
      await processAutomationTrigger('contact_created', 'contact', contact._id, contact.toObject());
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for your interest! Our team will contact you shortly.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Error capturing training interest lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your request. Please try again later.' 
    });
  }
};

// Capture mentoring interest
const captureMentoringInterestLead = async (req, res) => {
  try {
    const { name, email, phone, mentoringType, availability, message } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    // Check if contact already exists
    let contact = await Contact.findOne({ email });
    
    if (contact) {
      // Update existing contact
      contact.name = name;
      contact.phone = phone || contact.phone;
      
      // Add interest area if not present
      if (!contact.interestAreas.includes('mentoring')) {
        contact.interestAreas.push('mentoring');
      }
      
      // Add tags
      if (!contact.tags.includes('mentoring_interest')) {
        contact.tags.push('mentoring_interest');
      }
      if (!contact.tags.includes('website_lead')) {
        contact.tags.push('website_lead');
      }
      
      // Add communication history
      contact.communicationHistory.push({
        type: 'form_submission',
        date: new Date(),
        summary: `Expressed interest in mentoring: ${mentoringType || 'General'}`,
        engagement: {
          opened: false,
          clicked: false,
          bounced: false
        }
      });
      
      contact.notes = contact.notes 
        ? `${contact.notes}\n\n[${new Date().toISOString()}] Mentoring Interest: ${mentoringType || 'General'}\nAvailability: ${availability || 'Not specified'}\n${message || ''}`
        : `[${new Date().toISOString()}] Mentoring Interest: ${mentoringType || 'General'}\nAvailability: ${availability || 'Not specified'}\n${message || ''}`;
      
      contact.lastContactDate = new Date();
      contact.leadScore = Math.min(100, contact.leadScore + 15); // Higher score for specific interest
      
      await contact.save();
      
      await processAutomationTrigger('contact_updated', 'contact', contact._id, contact.toObject());
    } else {
      // Create new contact
      contact = new Contact({
        name,
        email,
        phone: phone || '',
        contactType: 'prospect',
        leadSource: 'website',
        status: 'active',
        tags: ['website_lead', 'mentoring_interest'],
        interestAreas: ['mentoring'],
        notes: `[${new Date().toISOString()}] Mentoring Interest: ${mentoringType || 'General'}\nAvailability: ${availability || 'Not specified'}\n${message || ''}`,
        communicationHistory: [
          {
            type: 'form_submission',
            date: new Date(),
            summary: `Expressed interest in mentoring: ${mentoringType || 'General'}`,
            engagement: {
              opened: false,
              clicked: false,
              bounced: false
            }
          }
        ],
        emailPreferences: {
          marketing: true,
          training: true,
          newsletters: true,
          updates: true
        },
        leadScore: 25, // Higher initial score for mentoring interest
        lastContactDate: new Date()
      });
      
      await contact.save();
      
      await processAutomationTrigger('contact_created', 'contact', contact._id, contact.toObject());
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Thank you for your interest! Our team will contact you shortly.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Error capturing mentoring interest lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your request. Please try again later.' 
    });
  }
};

module.exports = {
  captureContactFormLead,
  captureSubscriberLead,
  captureTrainingInterestLead,
  captureMentoringInterestLead
};

