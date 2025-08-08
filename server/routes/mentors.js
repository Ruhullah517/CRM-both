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

router.get('/', getAllMentors);
router.get('/:id', getMentorById);
router.post('/', createMentor);
router.put('/:id', updateMentor);
router.put('/:id/assign-mentees', assignMenteesToMentor);
router.delete('/:id', deleteMentor);

module.exports = router; 