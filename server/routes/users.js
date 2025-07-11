const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, loginUser, updateUser, deleteUser, getUserById } = require('../controllers/userController');

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', getAllUsers);

// @route   POST api/users
// @desc    Create a user
// @access  Public
router.post('/', createUser);

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/users/:id
// @desc    Get a single user by ID
// @access  Public (should be protected in production)
router.get('/:id', getUserById);

// @route   PUT api/users/:id
// @desc    Update a user
// @access  Public (should be protected in production)
router.put('/:id', updateUser);

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Public (should be protected in production)
router.delete('/:id', deleteUser);

module.exports = router;