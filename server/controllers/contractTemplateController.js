const ContractTemplate = require('../models/ContractTemplate');

// List all contract templates
const getAllContractTemplates = async (req, res) => {
  try {
    const templates = await ContractTemplate.find();
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single contract template by ID
const getContractTemplateById = async (req, res) => {
  try {
    const template = await ContractTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ msg: 'Contract template not found' });
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new contract template
const createContractTemplate = async (req, res) => {
  const { name, role, body } = req.body;
  try {
    const template = new ContractTemplate({ name, role, body });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a contract template
const updateContractTemplate = async (req, res) => {
  const { name, role, body } = req.body;
  try {
    await ContractTemplate.findByIdAndUpdate(req.params.id, { name, role, body });
    res.json({ msg: 'Contract template updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a contract template
const deleteContractTemplate = async (req, res) => {
  try {
    await ContractTemplate.findByIdAndDelete(req.params.id);
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