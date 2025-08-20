const Trainer = require('../models/Trainer');
const User = require('../models/User');

// Get all trainers
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true })
      .populate('user', 'name email avatar')
      .sort({ 'user.name': 1 });
    res.json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get single trainer
const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'name email avatar');
    
    if (!trainer) {
      return res.status(404).json({ msg: 'Trainer not found' });
    }
    
    res.json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create new trainer
const createTrainer = async (req, res) => {
  try {
    const {
      userId,
      specialization,
      bio,
      experience,
      qualifications,
      hourlyRate,
      availability
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if trainer already exists for this user
    const existingTrainer = await Trainer.findOne({ user: userId });
    if (existingTrainer) {
      return res.status(400).json({ msg: 'Trainer profile already exists for this user' });
    }

    const trainer = new Trainer({
      user: userId,
      specialization,
      bio,
      experience,
      qualifications,
      hourlyRate,
      availability
    });

    await trainer.save();
    
    // Populate user data before sending response
    await trainer.populate('user', 'name email avatar');
    res.status(201).json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update trainer
const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    ).populate('user', 'name email avatar');
    
    if (!trainer) {
      return res.status(404).json({ msg: 'Trainer not found' });
    }
    
    res.json(trainer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete trainer (soft delete)
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updated_at: new Date() },
      { new: true }
    );
    
    if (!trainer) {
      return res.status(404).json({ msg: 'Trainer not found' });
    }
    
    res.json({ msg: 'Trainer deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get trainers by specialization
const getTrainersBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    const query = { isActive: true };
    if (specialization) {
      query.specialization = { $in: [specialization] };
    }
    
    const trainers = await Trainer.find(query)
      .populate('user', 'name email avatar')
      .sort({ 'user.name': 1 });
    
    res.json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainersBySpecialization
};
