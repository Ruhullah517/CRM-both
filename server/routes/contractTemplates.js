const express = require('express');
const router = express.Router();
const {
  getAllContractTemplates,
  getContractTemplateById,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate,
} = require('../controllers/contractTemplateController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllContractTemplates);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getContractTemplateById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createContractTemplate);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), updateContractTemplate);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteContractTemplate);

module.exports = router; 