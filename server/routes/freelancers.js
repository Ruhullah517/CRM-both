const express = require('express');
const router = express.Router();
const {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
} = require('../controllers/freelancerController');
const freelancerUploads = require('../middleware/freelancerUploads');

router.get('/', getAllFreelancers);
router.get('/:id', getFreelancerById);
router.post('/', freelancerUploads, createFreelancer);
router.put('/:id', freelancerUploads, updateFreelancer);
router.delete('/:id', deleteFreelancer);

module.exports = router; 