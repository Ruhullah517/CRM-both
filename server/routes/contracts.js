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

// List all generated contracts
router.get('/', getAllGeneratedContracts);
// Get a single generated contract
router.get('/:id', getGeneratedContract);
// Generate a new contract
router.post('/generate', generateContract);
// Send for e-signature
router.post('/:id/send-signature', sendForSignature);
// Download contract PDF
router.get('/:id/download', downloadContract);
// Delete a generated contract
router.delete('/:id', deleteGeneratedContract);

module.exports = router; 