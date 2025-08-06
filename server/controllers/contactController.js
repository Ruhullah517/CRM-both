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
  // Remove user_id from req.body
  const { name, email, phone, type, tags, notes, emailHistory, organizationName, organizationAddress, communicationHistory } = req.body;
  try {
    const contact = new Contact({
      // user_id: req.user._id,
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
  const { name, email, phone, type, tags, notes, emailHistory, organizationName, organizationAddress, communicationHistory } = req.body;
  try {
    await Contact.findByIdAndUpdate(req.params.id, {
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
    });
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

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
}; 