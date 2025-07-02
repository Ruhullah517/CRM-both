const Contract = require('../models/Contract');

// List all contracts
const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate('createdBy', 'name email role');
    res.json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single contract by ID
const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate('createdBy', 'name email role');
    if (!contract) return res.status(404).json({ msg: 'Contract not found' });
    res.json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contract
const createContract = async (req, res) => {
  const { candidate_id, template_id, name, role, createdBy, start_date, end_date, status, signed, file_url } = req.body;
  try {
    const contract = new Contract({
      candidate_id,
      template_id,
      name,
      role,
      createdBy,
      start_date,
      end_date,
      status,
      signed,
      file_url
    });
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contract
const updateContract = async (req, res) => {
  const { candidate_id, template_id, name, role, createdBy, start_date, end_date, status, signed, file_url } = req.body;
  try {
    await Contract.findByIdAndUpdate(req.params.id, {
      candidate_id,
      template_id,
      name,
      role,
      createdBy,
      start_date,
      end_date,
      status,
      signed,
      file_url
    });
    res.json({ msg: 'Contract updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contract
const deleteContract = async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
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