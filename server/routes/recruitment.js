const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const Freelancer = require('../models/Freelancer');
const Mentor = require('../models/Mentor');
const FullAssessment = require('../models/FullAssessment');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/recruitment';
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Public routes for recruitment applications
router.post('/mentor-application', upload.fields([
  { name: 'documents.cv', maxCount: 1 },
  { name: 'documents.qualifications', maxCount: 1 },
  { name: 'documents.dbs', maxCount: 1 },
  { name: 'documents.references', maxCount: 1 }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    // Create mentor record
    const mentorData = {
      name: `${formData.personalInfo_firstName} ${formData.personalInfo_lastName}`,
      email: formData.personalInfo_email,
      phone: formData.personalInfo_phone,
      address: formData.personalInfo_address,
      postcode: formData.personalInfo_postcode,
      dateOfBirth: formData.personalInfo_dateOfBirth,
      qualifications: formData.professionalInfo_qualifications,
      experience: formData.professionalInfo_experience,
      specializations: formData.professionalInfo_specializations,
      yearsExperience: formData.professionalInfo_yearsExperience,
      preferredHours: formData.availability_preferredHours,
      availableDays: JSON.parse(formData.availability_availableDays || '[]'),
      travelWillingness: formData.availability_travelWillingness,
      motivation: formData.additionalInfo_motivation,
      additionalSkills: formData.additionalInfo_additionalSkills,
      emergencyContact: formData.additionalInfo_emergencyContact,
      emergencyPhone: formData.additionalInfo_emergencyPhone,
      status: 'pending',
      applicationDate: new Date(),
      documents: {}
    };

    // Handle file uploads
    if (files) {
      Object.entries(files).forEach(([fieldName, fileArray]) => {
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          const field = fieldName.replace('documents.', '');
          mentorData.documents[field] = {
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          };
        }
      });
    }

    const mentor = new Mentor(mentorData);
    await mentor.save();

    res.status(201).json({
      success: true,
      message: 'Mentor application submitted successfully',
      applicationId: mentor._id
    });
  } catch (error) {
    console.error('Error creating mentor application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit mentor application',
      error: error.message
    });
  }
});

router.post('/freelancer-application', upload.fields([
  { name: 'documents.cv', maxCount: 1 },
  { name: 'documents.qualifications', maxCount: 1 },
  { name: 'documents.dbs', maxCount: 1 },
  { name: 'documents.references', maxCount: 1 },
  { name: 'documents.insurance', maxCount: 1 }
]), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    // Create freelancer record
    const freelancerData = {
      name: `${formData.personalInfo_firstName} ${formData.personalInfo_lastName}`,
      email: formData.personalInfo_email,
      phone: formData.personalInfo_phone,
      address: formData.personalInfo_address,
      postcode: formData.personalInfo_postcode,
      dateOfBirth: formData.personalInfo_dateOfBirth,
      nationalInsurance: formData.personalInfo_nationalInsurance,
      roleType: formData.professionalInfo_roleType,
      qualifications: formData.professionalInfo_qualifications,
      experience: formData.professionalInfo_experience,
      specializations: formData.professionalInfo_specializations,
      yearsExperience: formData.professionalInfo_yearsExperience,
      hourlyRate: parseFloat(formData.professionalInfo_hourlyRate) || 0,
      dailyRate: parseFloat(formData.professionalInfo_dailyRate) || 0,
      preferredHours: formData.availability_preferredHours,
      availableDays: JSON.parse(formData.availability_availableDays || '[]'),
      travelWillingness: formData.availability_travelWillingness,
      noticePeriod: formData.availability_noticePeriod,
      motivation: formData.additionalInfo_motivation,
      additionalSkills: formData.additionalInfo_additionalSkills,
      emergencyContact: formData.additionalInfo_emergencyContact,
      emergencyPhone: formData.additionalInfo_emergencyPhone,
      bankDetails: {
        accountName: formData.additionalInfo_bankDetails_accountName,
        accountNumber: formData.additionalInfo_bankDetails_accountNumber,
        sortCode: formData.additionalInfo_bankDetails_sortCode
      },
      status: 'pending',
      applicationDate: new Date(),
      documents: {}
    };

    // Handle file uploads
    if (files) {
      Object.entries(files).forEach(([fieldName, fileArray]) => {
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          const field = fieldName.replace('documents.', '');
          freelancerData.documents[field] = {
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          };
        }
      });
    }

    const freelancer = new Freelancer(freelancerData);
    await freelancer.save();

    res.status(201).json({
      success: true,
      message: 'Freelancer application submitted successfully',
      applicationId: freelancer._id
    });
  } catch (error) {
    console.error('Error creating freelancer application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit freelancer application',
      error: error.message
    });
  }
});

// Protected routes for managing recruitment applications
router.use(authenticate, authorize('admin', 'manager', 'staff'));

// Get all mentor applications
router.get('/mentor-applications', async (req, res) => {
  try {
    const applications = await Mentor.find().sort({ applicationDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all freelancer applications
router.get('/freelancer-applications', async (req, res) => {
  try {
    const applications = await Freelancer.find().sort({ applicationDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update mentor application status
router.put('/mentor-applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor application not found' });
    }
    
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update freelancer application status
router.put('/freelancer-applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer application not found' });
    }
    
    res.json(freelancer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recruitment statistics
router.get('/statistics', async (req, res) => {
  try {
    const mentorStats = await Mentor.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const freelancerStats = await Freelancer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const enquiryStats = await Enquiry.aggregate([
      { $group: { _id: '$pipelineStage', count: { $sum: 1 } } }
    ]);
    
    res.json({
      mentors: mentorStats,
      freelancers: freelancerStats,
      enquiries: enquiryStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Full Assessment routes
// Create full assessment
router.post('/enquiries/:enquiryId/full-assessment', async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const { recommendation, checksDone, notes, meetingType, meetingDate, assessorId } = req.body;
    
    console.log('Full assessment creation request:', {
      enquiryId,
      recommendation,
      checksDone,
      notes,
      meetingType,
      meetingDate,
      assessorId,
      userId: req.user?.id
    });
    
    // Check if enquiry exists
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      console.log('Enquiry not found:', enquiryId);
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    
    // Create full assessment
    const fullAssessmentData = {
      enquiryId,
      assessorId: assessorId || req.user.id,
      recommendation,
      checksDone: checksDone || [],
      notes,
      meetingType,
      meetingDate: meetingDate ? new Date(meetingDate) : null,
      date: new Date()
    };
    
    console.log('Creating full assessment with data:', fullAssessmentData);
    
    const fullAssessment = new FullAssessment(fullAssessmentData);
    await fullAssessment.save();
    
    console.log('Full assessment created successfully:', fullAssessment._id);
    res.status(201).json(fullAssessment);
  } catch (error) {
    console.error('Error creating full assessment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Get full assessment by enquiry ID
router.get('/enquiries/:enquiryId/full-assessment', async (req, res) => {
  try {
    const { enquiryId } = req.params;
    
    const fullAssessment = await FullAssessment.findOne({ enquiryId })
      .populate('assessorId', 'name email')
      .populate('enquiryId', 'full_name email_address');
    
    if (!fullAssessment) {
      return res.status(404).json({ error: 'Full assessment not found' });
    }
    
    res.json(fullAssessment);
  } catch (error) {
    console.error('Error fetching full assessment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update full assessment
router.put('/enquiries/:enquiryId/full-assessment', async (req, res) => {
  try {
    const { enquiryId } = req.params;
    const updateData = req.body;
    
    const fullAssessment = await FullAssessment.findOneAndUpdate(
      { enquiryId },
      { ...updateData, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.json(fullAssessment);
  } catch (error) {
    console.error('Error updating full assessment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;