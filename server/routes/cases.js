const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const upload = require('../middleware/upload');
const { uploadCaseFile } = require('../controllers/caseController');

router.get('/', getAllCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.post('/upload', upload, uploadCaseFile);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router; 