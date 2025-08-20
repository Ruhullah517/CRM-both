const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainersBySpecialization
} = require('../controllers/trainerController');

// All routes require authentication
router.use(authenticate);

// GET /api/trainers - Get all trainers
router.get('/', getAllTrainers);

// GET /api/trainers/specialization - Get trainers by specialization
router.get('/specialization', getTrainersBySpecialization);

// GET /api/trainers/:id - Get single trainer
router.get('/:id', getTrainerById);

// POST /api/trainers - Create new trainer
router.post('/', createTrainer);

// PUT /api/trainers/:id - Update trainer
router.put('/:id', updateTrainer);

// DELETE /api/trainers/:id - Delete trainer (soft delete)
router.delete('/:id', deleteTrainer);

module.exports = router;
