const db = require('../config/db');

// List all contacts
const getAllContacts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contacts');
    // Map created_at to dateAdded and parse tags/emailHistory
    const mapped = rows.map(c => ({
      ...c,
      dateAdded: c.created_at,
      tags: c.tags ? JSON.parse(c.tags) : [],
      emailHistory: c.emailHistory ? JSON.parse(c.emailHistory) : [],
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
    const [rows] = await db.query('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Contact not found' });
    const c = rows[0];
    res.json({
      ...c,
      dateAdded: c.created_at,
      tags: c.tags ? JSON.parse(c.tags) : [],
      emailHistory: c.emailHistory ? JSON.parse(c.emailHistory) : [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contact
const createContact = async (req, res) => {
  const { user_id, name, email, phone, type, tags, notes, emailHistory } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contacts (user_id, name, email, phone, type, tags, notes, emailHistory) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, email, phone, type, JSON.stringify(tags || []), notes || '', JSON.stringify(emailHistory || [])]
    );
    res.status(201).json({ id: result.insertId, user_id, name, email, phone, type, tags, notes, emailHistory });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contact
const updateContact = async (req, res) => {
  const { name, email, phone, type, tags, notes, emailHistory } = req.body;
  try {
    await db.query(
      'UPDATE contacts SET name = ?, email = ?, phone = ?, type = ?, tags = ?, notes = ?, emailHistory = ? WHERE id = ?',
      [name, email, phone, type, JSON.stringify(tags || []), notes || '', JSON.stringify(emailHistory || []), req.params.id]
    );
    res.json({ msg: 'Contact updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contact
const deleteContact = async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
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