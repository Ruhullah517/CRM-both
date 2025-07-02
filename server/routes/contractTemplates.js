const express = require('express');
const router = express.Router();
const {
  getAllContractTemplates,
  getContractTemplateById,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
} = require('../controllers/contractTemplateController');

router.get('/', getAllContractTemplates);
router.get('/:id', getContractTemplateById);
router.post('/', createContractTemplate);
router.put('/:id', updateContractTemplate);
router.delete('/:id', deleteContractTemplate);

module.exports = router; 