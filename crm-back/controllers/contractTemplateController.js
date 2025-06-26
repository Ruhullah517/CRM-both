const db = require('../config/db');

// List all contract templates
const getAllContractTemplates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contract_templates');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single contract template by ID
const getContractTemplateById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contract_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Contract template not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contract template
const createContractTemplate = async (req, res) => {
  const { name, role, body } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contract_templates (name, role, body) VALUES (?, ?, ?)',
      [name, role, body]
    );
    res.status(201).json({ id: result.insertId, name, role, body });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contract template
const updateContractTemplate = async (req, res) => {
  const { name, role, body } = req.body;
  try {
    await db.query(
      'UPDATE contract_templates SET name = ?, role = ?, body = ? WHERE id = ?',
      [name, role, body, req.params.id]
    );
    res.json({ msg: 'Contract template updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contract template
const deleteContractTemplate = async (req, res) => {
  try {
    await db.query('DELETE FROM contract_templates WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Contract template deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllContractTemplates,
  getContractTemplateById,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
}; 