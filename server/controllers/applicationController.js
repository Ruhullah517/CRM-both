const Application = require('../models/Application');
const mongoose = require('mongoose');
const path = require('path');

const uploadApplication = async (req, res) => {
  const { enquiryId } = req.body;
  const filePath = path.join('uploads', req.file.filename);

  try {
    // Check if an application for this enquiry already exists
    let application = await Application.findOne({ enquiry_id: enquiryId });

    if (application) {
      // Update existing application
      application.application_form_path = filePath;
      application.status = 'Uploaded';
      application.updated_at = new Date();
      await application.save();
    } else {
      // Insert new application
      application = new Application({
        enquiry_id: enquiryId,
        application_form_path: filePath,
        status: 'Uploaded',
      });
      await application.save();
    }

    res.json({
      msg: 'File uploaded successfully',
      filePath: filePath,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const getApplicationByEnquiryId = async (req, res) => {
  try {
    // Check if the parameter is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.enquiryId)) {
      return res.status(400).json({ msg: 'Invalid enquiry ID format' });
    }
    
    const application = await Application.findOne({ enquiry_id: req.params.enquiryId });
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  uploadApplication,
  getApplicationByEnquiryId,
}; 