const Contact = require('../models/Contact');

// List all contacts
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    // Map created_at to dateAdded for compatibility
    const mapped = contacts.map(c => ({
      ...c.toObject(),
      dateAdded: c.created_at,
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single contact by ID
const getContactById = async (req, res) => {
  try {
    const c = await Contact.findById(req.params.id);
    if (!c) return res.status(404).json({ msg: 'Contact not found' });
    res.json({
      ...c.toObject(),
      dateAdded: c.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contact
const createContact = async (req, res) => {
  const { 
    name, email, phone, type, tags, notes, emailHistory, organizationName, organizationAddress, 
    communicationHistory, contactType, interestAreas, leadSource, leadScore, status,
    emailPreferences, nextFollowUpDate
  } = req.body;
  
  try {
    const contact = new Contact({
      name,
      email,
      phone,
      type,
      tags: tags || [],
      notes: notes || '',
      emailHistory: emailHistory || [],
      organizationName,
      organizationAddress,
      communicationHistory: communicationHistory || [],
      contactType: contactType || 'prospect',
      interestAreas: interestAreas || [],
      leadSource: leadSource || '',
      leadScore: leadScore || 0,
      status: status || 'active',
      emailPreferences: emailPreferences || {
        marketing: true,
        training: true,
        newsletters: true,
        updates: true
      },
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      lastContactDate: new Date()
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contact
const updateContact = async (req, res) => {
  const { 
    name, email, phone, type, tags, notes, emailHistory, organizationName, organizationAddress, 
    communicationHistory, contactType, interestAreas, leadSource, leadScore, status,
    emailPreferences, nextFollowUpDate
  } = req.body;
  
  try {
    const updateData = {
      name,
      email,
      phone,
      type,
      tags: tags || [],
      notes: notes || '',
      emailHistory: emailHistory || [],
      organizationName,
      organizationAddress,
      communicationHistory: communicationHistory || [],
      contactType: contactType || 'prospect',
      interestAreas: interestAreas || [],
      leadSource: leadSource || '',
      leadScore: leadScore || 0,
      status: status || 'active',
      emailPreferences: emailPreferences || {
        marketing: true,
        training: true,
        newsletters: true,
        updates: true
      },
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      updated_at: new Date()
    };
    
    await Contact.findByIdAndUpdate(req.params.id, updateData);
    res.json({ msg: 'Contact updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Contact deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get contacts by tags
const getContactsByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({ msg: 'Tags parameter is required' });
    }
    
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const contacts = await Contact.find({ 
      tags: { $in: tagArray },
      status: 'active'
    });
    
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get contacts by contact type
const getContactsByType = async (req, res) => {
  try {
    const { contactType } = req.params;
    const contacts = await Contact.find({ 
      contactType,
      status: 'active'
    });
    
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get contacts needing follow-up
const getContactsNeedingFollowUp = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    
    const contacts = await Contact.find({
      nextFollowUpDate: { $lte: futureDate },
      status: 'active'
    }).sort({ nextFollowUpDate: 1 });
    
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Add communication history entry
const addCommunicationHistory = async (req, res) => {
  try {
    const { type, summary, engagement } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }
    
    const historyEntry = {
      type,
      date: new Date(),
      summary,
      engagement: engagement || { opened: false, clicked: false, bounced: false }
    };
    
    contact.communicationHistory.push(historyEntry);
    contact.lastContactDate = new Date();
    await contact.save();
    
    res.json({ msg: 'Communication history added', contact });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update contact lead score
const updateLeadScore = async (req, res) => {
  try {
    const { leadScore } = req.body;
    
    if (leadScore < 0 || leadScore > 100) {
      return res.status(400).json({ msg: 'Lead score must be between 0 and 100' });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { leadScore, updated_at: new Date() },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ msg: 'Contact not found' });
    }
    
    res.json({ msg: 'Lead score updated', contact });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get contact statistics
const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$contactType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalContacts = await Contact.countDocuments();
    const activeContacts = await Contact.countDocuments({ status: 'active' });
    const contactsNeedingFollowUp = await Contact.countDocuments({
      nextFollowUpDate: { $lte: new Date() },
      status: 'active'
    });
    
    res.json({
      totalContacts,
      activeContacts,
      contactsNeedingFollowUp,
      byType: stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Bulk update contacts
const bulkUpdateContacts = async (req, res) => {
  try {
    const { contactIds, updateData } = req.body;
    
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ msg: 'Contact IDs array is required' });
    }
    
    const result = await Contact.updateMany(
      { _id: { $in: contactIds } },
      { ...updateData, updated_at: new Date() }
    );
    
    res.json({ 
      msg: `${result.modifiedCount} contacts updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactsByTags,
  getContactsByType,
  getContactsNeedingFollowUp,
  addCommunicationHistory,
  updateLeadScore,
  getContactStats,
  bulkUpdateContacts,
}; 