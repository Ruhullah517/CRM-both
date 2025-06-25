const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, loginUser } = require('../controllers/userController');

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

module.exports = router;