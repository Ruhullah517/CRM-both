const express = require('express');
const router = express.Router();
const {
  getAllGeneratedContracts,
  getGeneratedContract,
  generateContract,
  sendForSignature,
  downloadContract,
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
// Download contract PDF
router.get('/:id/download', authenticate, authorize('admin', 'manager', 'staff'), downloadContract);
// Delete a generated contract
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteGeneratedContract);

module.exports = router; 