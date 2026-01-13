const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { getAllUsers, createUser, loginUser, updateUser, deleteUser, getUserById, forgotPassword, resetPassword } = require('../controllers/userController');

// @route   GET api/users
// @desc    Get all users
// @access  Admin only
router.get('/', authenticate, authorize('admin'), getAllUsers);

// @route   POST api/users
// @desc    Create a user
// @access  Admin only
router.post('/', authenticate, authorize('admin'), createUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Get all staff (caseworkers, admins, managers)
router.get('/staff', authenticate, authorize('admin', 'manager', 'staff', 'caseworker'), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'manager', 'caseworker'] } }, 'name _id role');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// @route   GET api/users/:id
// @desc    Get a single user by ID
// @access  Authenticated (self or admin)
router.get('/:id', authenticate, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}, getUserById);

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Authenticated (self or admin)
router.put('/:id', authenticate, async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}, updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;