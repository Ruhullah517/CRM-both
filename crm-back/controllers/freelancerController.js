const Freelancer = require('../models/Freelancer');

// List all freelancers
const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    // Map contract_date to contractDate for frontend
    const mapped = freelancers.map(f => ({ ...f.toObject(), contractDate: f.contract_date }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single freelancer by ID
const getFreelancerById = async (req, res) => {
  try {
    const f = await Freelancer.findById(req.params.id);
    if (!f) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json({ ...f.toObject(), contractDate: f.contract_date });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new freelancer
const createFreelancer = async (req, res) => {
  const { name, role, status, availability, email, skills, complianceDocs, assignments, contractDate } = req.body;
  try {
    const freelancer = new Freelancer({
      name,
      role,
      status,
      availability,
      email,
      skills,
      complianceDocs: complianceDocs || [],
      assignments: assignments || [],
      contract_date: contractDate || null
    });
    await freelancer.save();
    res.status(201).json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a freelancer
const updateFreelancer = async (req, res) => {
  const { name, role, status, availability, email, skills, complianceDocs, assignments, contractDate } = req.body;
  try {
    await Freelancer.findByIdAndUpdate(req.params.id, {
      name,
      role,
      status,
      availability,
      email,
      skills,
      complianceDocs: complianceDocs || [],
      assignments: assignments || [],
      contract_date: contractDate || null
    });
    res.json({ msg: 'Freelancer updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a freelancer
const deleteFreelancer = async (req, res) => {
  try {
    await Freelancer.findByIdAndDelete(req.params.id);
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