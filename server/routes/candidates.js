const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  assignMentorToCandidate,
} = require('../controllers/candidateController');

// Document upload endpoint
router.post('/upload-document', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);
router.post('/', createCandidate);
router.put('/:id', updateCandidate);
router.put('/:id/assign-mentor', assignMentorToCandidate);
router.delete('/:id', deleteCandidate);

module.exports = router; 