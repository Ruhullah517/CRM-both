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
const { authenticate, authorize } = require('../middleware/auth');

// Document upload endpoint
router.post('/upload-document', authenticate, authorize('admin', 'manager', 'staff'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllCandidates);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getCandidateById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createCandidate);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), updateCandidate);
router.put('/:id/assign-mentor', authenticate, authorize('admin', 'manager', 'staff'), assignMentorToCandidate);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteCandidate);

module.exports = router; 