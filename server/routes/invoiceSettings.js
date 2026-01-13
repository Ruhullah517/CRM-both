const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const InvoiceSettings = require('../models/InvoiceSettings');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Get current invoice settings (single document)
router.get('/', async (req, res) => {
  try {
    let settings = await InvoiceSettings.findOne();

    if (!settings) {
      settings = new InvoiceSettings();
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update invoice settings
router.put('/', async (req, res) => {
  try {
    const updates = req.body || {};

    let settings = await InvoiceSettings.findOne();
    if (!settings) {
      settings = new InvoiceSettings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;


