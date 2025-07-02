const express = require('express');
const router = express.Router();
const {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
} = require('../controllers/freelancerController');

router.get('/', getAllFreelancers);
router.get('/:id', getFreelancerById);
router.post('/', createFreelancer);
router.put('/:id', updateFreelancer);
router.delete('/:id', deleteFreelancer);

module.exports = router; 