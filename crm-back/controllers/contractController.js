const db = require('../config/db');

// List all contracts
const getAllContracts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contracts');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single contract by ID
const getContractById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contracts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Contract not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contract
const createContract = async (req, res) => {
  const { name, role, status, createdBy, filePath } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contracts (name, role, status, createdBy, filePath) VALUES (?, ?, ?, ?, ?)',
      [name, role, status, createdBy, filePath || null]
    );
    res.status(201).json({ id: result.insertId, name, role, status, createdBy, filePath });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contract
const updateContract = async (req, res) => {
  const { name, role, status, createdBy, filePath } = req.body;
  try {
    await db.query(
      'UPDATE contracts SET name = ?, role = ?, status = ?, createdBy = ?, filePath = ? WHERE id = ?',
      [name, role, status, createdBy, filePath || null, req.params.id]
    );
    res.json({ msg: 'Contract updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contract
const deleteContract = async (req, res) => {
  try {
    await db.query('DELETE FROM contracts WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Contract deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
}; 