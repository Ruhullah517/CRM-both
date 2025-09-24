const InitialAssessment = require('../models/InitialAssessment');
const mongoose = require('mongoose');

// Create a new assessment
const createAssessment = async (req, res) => {
  const { enquiry_id, staff_id, assessment_notes, assessment_date, attachments, status } = req.body;
  try {
    const assessment = new InitialAssessment({
      enquiry_id,
      staff_id,
      assessment_notes,
      assessment_date,
      attachments,
      status: status || 'Pending',
    });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get assessment by enquiry ID
const getAssessmentByEnquiryId = async (req, res) => {
  try {
    // Check if the parameter is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.enquiryId)) {
      return res.status(400).json({ msg: 'Invalid enquiry ID format' });
    }
    
    const assessment = await InitialAssessment.findOne({ enquiry_id: req.params.enquiryId });
    if (!assessment) return res.status(404).json({ msg: 'Assessment not found' });
    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Upload assessment attachments
const uploadAttachments = async (req, res) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');

    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = 'uploads/assessments';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({ 
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed'));
        }
      }
    });

    upload.array('attachments', 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const urls = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        url: `/uploads/assessments/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      }));

      res.json({
        success: true,
        urls: urls,
        message: `${req.files.length} file(s) uploaded successfully`
      });
    });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
};

// Upload single assessment attachment
const uploadAttachment = async (req, res) => {
  try {
    const multer = require('multer');
    const path = require('path');
    const fs = require('fs');

    // Configure multer for single file upload
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = 'uploads/assessments';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, TXT files are allowed'));
        }
      }
    });

    upload.single('attachment')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/assessments/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        message: 'File uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
};

module.exports = {
  createAssessment,
  getAssessmentByEnquiryId,
  uploadAttachments,
  uploadAttachment
}; 