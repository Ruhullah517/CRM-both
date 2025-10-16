const express = require('express');
const router = express.Router();
const {
  getAllGeneratedContracts,
  getGeneratedContract,
  generateContract,
  sendForSignature,
  downloadContract,
  getContractStatus,
  handleDocuSignWebhook,
  updateContractStatus,
  deleteGeneratedContract,
} = require('../controllers/contractController');
const { authenticate, authorize } = require('../middleware/auth');

// List all generated contracts
router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllGeneratedContracts);
// Get a single generated contract
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getGeneratedContract);
// Generate a new contract
router.post('/generate', authenticate, authorize('admin', 'manager', 'staff'), generateContract);
// Send for e-signature
router.post('/:id/send-signature', authenticate, authorize('admin', 'manager', 'staff'), sendForSignature);
// Get contract signature status
router.get('/:id/status', authenticate, authorize('admin', 'manager', 'staff'), getContractStatus);
// Update contract status
router.put('/:id/status', authenticate, authorize('admin', 'manager', 'staff'), updateContractStatus);
// Download contract PDF
router.get('/:id/download', authenticate, authorize('admin', 'manager', 'staff'), downloadContract);
// DocuSign webhook (no auth required)
router.post('/webhook/docusign', handleDocuSignWebhook);
// Delete a generated contract
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteGeneratedContract);

module.exports = router; 