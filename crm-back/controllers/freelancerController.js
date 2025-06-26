const db = require('../config/db');

// List all freelancers
const getAllFreelancers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM freelancers');
    // Map contract_date to contractDate for frontend
    const mapped = rows.map(f => ({ ...f, contractDate: f.contract_date }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single freelancer by ID
const getFreelancerById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM freelancers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Freelancer not found' });
    const f = rows[0];
    res.json({ ...f, contractDate: f.contract_date });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new freelancer
const createFreelancer = async (req, res) => {
  const { name, role, status, availability, email, skills, complianceDocs, assignments, contractDate } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO freelancers (name, role, status, availability, email, skills, complianceDocs, assignments, contract_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, role, status, availability, email, skills, JSON.stringify(complianceDocs || []), JSON.stringify(assignments || []), contractDate || null]
    );
    res.status(201).json({ id: result.insertId, name, role, status, availability, email, skills, complianceDocs, assignments, contractDate });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a freelancer
const updateFreelancer = async (req, res) => {
  const { name, role, status, availability, email, skills, complianceDocs, assignments, contractDate } = req.body;
  try {
    await db.query(
      'UPDATE freelancers SET name = ?, role = ?, status = ?, availability = ?, email = ?, skills = ?, complianceDocs = ?, assignments = ?, contract_date = ? WHERE id = ?',
      [name, role, status, availability, email, skills, JSON.stringify(complianceDocs || []), JSON.stringify(assignments || []), contractDate || null, req.params.id]
    );
    res.json({ msg: 'Freelancer updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a freelancer
const deleteFreelancer = async (req, res) => {
  try {
    await db.query('DELETE FROM freelancers WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Freelancer deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
}; 