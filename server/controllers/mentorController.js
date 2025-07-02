const Mentor = require('../models/Mentor');

// List all mentors
const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    // Map created_at to dateAdded for frontend compatibility
    const mapped = mentors.map(m => ({
      ...m.toObject(),
      dateAdded: m.created_at,
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single mentor by ID
const getMentorById = async (req, res) => {
  try {
    const m = await Mentor.findById(req.params.id);
    if (!m) return res.status(404).json({ msg: 'Mentor not found' });
    res.json({
      ...m.toObject(),
      dateAdded: m.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new mentor
const createMentor = async (req, res) => {
  const { name, email, phone, skills, status, avatar, mentees } = req.body;
  try {
    const mentor = new Mentor({
      name,
      email,
      phone,
      skills: skills || [],
      status,
      avatar,
      mentees: mentees || [],
    });
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a mentor
const updateMentor = async (req, res) => {
  const { name, email, phone, skills, status, avatar, mentees } = req.body;
  try {
    await Mentor.findByIdAndUpdate(req.params.id, {
      name,
      email,
      phone,
      skills: skills || [],
      status,
      avatar,
      mentees: mentees || [],
    });
    res.json({ msg: 'Mentor updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a mentor
const deleteMentor = async (req, res) => {
  try {
    await Mentor.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Mentor deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
}; 