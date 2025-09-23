const express = require('express');
const router = express.Router();
const {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  assignMenteesToMentor,
} = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllMentors);
router.get('/:id', authenticate, authorize('admin', 'manager', 'staff'), getMentorById);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createMentor);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff'), updateMentor);
router.put('/:id/assign-mentees', authenticate, authorize('admin', 'manager', 'staff'), assignMenteesToMentor);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteMentor);

module.exports = router; 