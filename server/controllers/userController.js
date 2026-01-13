const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'id name email role created_at');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create user
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ id: user._id, name, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const crypto = require('crypto');
const { sendMail, getFromAddress } = require('../utils/mailer');

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    // If mentor user missing mentorId, try to link by email
    let mentorId = user.mentorId;
    if (!mentorId && user.role === 'mentor' && user.email) {
      const Mentor = require('../models/Mentor');
      const mentor = await Mentor.findOne({ email: user.email });
      if (mentor) {
        mentorId = mentor._id;
        user.mentorId = mentor._id;
        await user.save();
      }
    }

    // Create JWT (include mentorId/freelancerId when relevant)
    const payload = {
      user: {
        id: user._id,
        role: user.role,
        mentorId,
        freelancerId: user.freelancerId
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        const { _id, name, email, role, freelancerId } = user;
        res.json({ token, user: { id: _id, name, email, role, mentorId, freelancerId } });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // Always respond 200 to avoid user enumeration
    if (!user) return res.json({ msg: 'If the email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const { getFrontendUrl } = require('../config/urls');
    const frontendBase = getFrontendUrl();
    const resetUrl = `${frontendBase}/reset-password?token=${token}`;

    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
      subject: 'Reset your BFCA CRM password',
      html: `<div style="font-family: Arial, sans-serif;">
        <p>Hello ${user.name || ''},</p>
        <p>We received a request to reset your BFCA CRM password. Click the button below to set a new password. This link will expire in 30 minutes.</p>
        <p style="margin:20px 0;"><a href="${resetUrl}" style="background:#2EAB2C;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #2EAB2C; text-decoration: none;">${resetUrl}</a></p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
      </div>`
    };

    try {
      await sendMail(mailOptions);
    } catch (e) {
      // If email fails, still return success to avoid information leaks
    }

    res.json({ msg: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updated_at = new Date();
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, avatar } = req.body;
  try {
    const update = { name, email, role };
    if (avatar !== undefined) update.avatar = avatar;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    await User.findByIdAndUpdate(id, update);
    res.json({ msg: 'User updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id, 'id name email role avatar created_at');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getUserById,
  forgotPassword,
  resetPassword,
}; 