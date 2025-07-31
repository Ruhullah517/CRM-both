const Freelancer = require('../models/Freelancer');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const FreelancerFormToken = require('../models/FreelancerFormToken');

// List all freelancers
const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find();
    // Map contract_date to contractDate for frontend
    const mapped = freelancers.map(f => ({ ...f.toObject(), contractDate: f.contract_date }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single freelancer by ID
const getFreelancerById = async (req, res) => {
  try {
    const f = await Freelancer.findById(req.params.id);
    if (!f) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json({ ...f.toObject(), contractDate: f.contract_date });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new freelancer
const createFreelancer = async (req, res) => {
  try {
    // Handle file uploads
    let dbsCertificateUrl = req.body.dbsCertificateUrl;
    let dbsCertificateFileName = req.body.dbsCertificateFileName;
    let cvUrl = req.body.cvUrl;
    let cvFileName = req.body.cvFileName;
    console.log(req.files);
    console.log(req.body);

    if (req.files) {
      if (req.files.dbsCertificateFile && req.files.dbsCertificateFile[0]) {
        dbsCertificateUrl = '/uploads/freelancers/' + req.files.dbsCertificateFile[0].filename;
        dbsCertificateFileName = req.files.dbsCertificateFile[0].originalname;
      }
      if (req.files.cvFile && req.files.cvFile[0]) {
        cvUrl = '/uploads/freelancers/' + req.files.cvFile[0].filename;
        cvFileName = req.files.cvFile[0].originalname;
      }
    }
    const freelancer = new Freelancer({
      // Section 1: Personal Information
      fullName: req.body.fullName,
      homeAddress: req.body.homeAddress,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      isOnWhatsApp: req.body.isOnWhatsApp,

      // Section 2: Professional Information
      hasSocialWorkEnglandRegistration: req.body.hasSocialWorkEnglandRegistration,
      socialWorkEnglandRegistrationNumber: req.body.socialWorkEnglandRegistrationNumber,
      hasDBSCheck: req.body.hasDBSCheck,
      isOnUpdateSystem: req.body.isOnUpdateSystem,
      dbsCertificateUrl,
      dbsCertificateFileName,

      // Section 3: Location & Availability
      currentLocation: req.body.currentLocation,
      geographicalLocation: req.body.geographicalLocation,
      role: req.body.role,
      milesWillingToTravel: req.body.milesWillingToTravel,

      // Section 4: Work Experience & Skills
      hasFormFAssessmentExperience: req.body.hasFormFAssessmentExperience,
      formFAssessmentExperienceYears: req.body.formFAssessmentExperienceYears,
      otherSocialWorkAssessmentExperience: req.body.otherSocialWorkAssessmentExperience,

      // Section 5: Consideration for Work & Training
      considerationFor: req.body.considerationFor,

      // Section 6: Additional Information
      qualificationsAndTraining: req.body.qualificationsAndTraining,
      additionalInfo: req.body.additionalInfo,
      professionalReferences: req.body.professionalReferences,
      cvUrl,
      cvFileName,

      // Section 7: Payment & Tax Information
      paymentPreferences: req.body.paymentPreferences,
      paymentOther: req.body.paymentOther,

      // Legacy fields (for compatibility)
      name: req.body.name,
      roleLegacy: req.body.roleLegacy,
      status: req.body.status,
      availability: req.body.availability,
      skills: req.body.skills,
      complianceDocs: req.body.complianceDocs || [],
      assignments: req.body.assignments || [],
      contract_date: req.body.contractDate || null
    });
    await freelancer.save();
    res.status(201).json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a freelancer
const updateFreelancer = async (req, res) => {
  try {
    // Handle file uploads
    let dbsCertificateUrl = req.body.dbsCertificateUrl;
    let dbsCertificateFileName = req.body.dbsCertificateFileName;
    let cvUrl = req.body.cvUrl;
    let cvFileName = req.body.cvFileName;
    console.log(req.files);
    console.log(req.body);
    if (req.files) {
      if (req.files.dbsCertificateFile && req.files.dbsCertificateFile[0]) {
        dbsCertificateUrl = '/uploads/freelancers/' + req.files.dbsCertificateFile[0].filename;
        dbsCertificateFileName = req.files.dbsCertificateFile[0].originalname;
      }
      if (req.files.cvFile && req.files.cvFile[0]) {
        cvUrl = '/uploads/freelancers/' + req.files.cvFile[0].filename;
        cvFileName = req.files.cvFile[0].originalname;
      }
    }
    await Freelancer.findByIdAndUpdate(req.params.id, {
      // Section 1: Personal Information
      fullName: req.body.fullName,
      homeAddress: req.body.homeAddress,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      isOnWhatsApp: req.body.isOnWhatsApp,

      // Section 2: Professional Information
      hasSocialWorkEnglandRegistration: req.body.hasSocialWorkEnglandRegistration,
      socialWorkEnglandRegistrationNumber: req.body.socialWorkEnglandRegistrationNumber,
      hasDBSCheck: req.body.hasDBSCheck,
      isOnUpdateSystem: req.body.isOnUpdateSystem,
      dbsCertificateUrl,
      dbsCertificateFileName,

      // Section 3: Location & Availability
      currentLocation: req.body.currentLocation,
      geographicalLocation: req.body.geographicalLocation,
      role: req.body.role,
      milesWillingToTravel: req.body.milesWillingToTravel,

      // Section 4: Work Experience & Skills
      hasFormFAssessmentExperience: req.body.hasFormFAssessmentExperience,
      formFAssessmentExperienceYears: req.body.formFAssessmentExperienceYears,
      otherSocialWorkAssessmentExperience: req.body.otherSocialWorkAssessmentExperience,

      // Section 5: Consideration for Work & Training
      considerationFor: req.body.considerationFor,

      // Section 6: Additional Information
      qualificationsAndTraining: req.body.qualificationsAndTraining,
      additionalInfo: req.body.additionalInfo,
      professionalReferences: req.body.professionalReferences,
      cvUrl,
      cvFileName,

      // Section 7: Payment & Tax Information
      paymentPreferences: req.body.paymentPreferences,
      paymentOther: req.body.paymentOther,

      // Legacy fields (for compatibility)
      name: req.body.name,
      roleLegacy: req.body.roleLegacy,
      status: req.body.status,
      availability: req.body.availability,
      skills: req.body.skills,
      complianceDocs: req.body.complianceDocs || [],
      assignments: req.body.assignments || [],
      contract_date: req.body.contractDate || null
    });
    res.json({ msg: 'Freelancer updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a freelancer
const deleteFreelancer = async (req, res) => {
  try {
    await Freelancer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Freelancer deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Send public freelancer form link to email
const sendFreelancerFormLink = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const token = uuidv4();
    const link = `https://crm-both.vercel.app/freelancer-form/${token}`;
    await FreelancerFormToken.create({ email, token });

    // Configure your transporter as per your SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ruhullah517@gmail.com',
        pass: 'vrcf pvht mrxd rnmq', // Use your App Password here (no spaces)
      }
    });

    await transporter.sendMail({
      from: 'ruhullah517@gmail.com',
      to: email,
      subject: 'Complete Your Freelancer Form',
      html: `<p>Please complete your freelancer form by clicking the link below:</p>
             <a href="${link}">${link}</a>`,
    });

    res.json({ message: 'Form link sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send form link' });
  }
};

const submitFreelancerPublicForm = async (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(400).json({ message: 'Missing token' });

  const tokenDoc = await FreelancerFormToken.findOne({ token });
  if (!tokenDoc || tokenDoc.used) {
    return res.status(400).json({ message: 'Invalid or expired link' });
  }

  // Save freelancer using existing createFreelancer logic
  // (Assume req.body contains all necessary fields, and file uploads are handled as in createFreelancer)
  try {
    // You may want to DRY this by calling createFreelancer, but for now, copy the logic
    let dbsCertificateUrl = req.body.dbsCertificateUrl;
    let dbsCertificateFileName = req.body.dbsCertificateFileName;
    let cvUrl = req.body.cvUrl;
    let cvFileName = req.body.cvFileName;

    if (req.files) {
      if (req.files.dbsCertificateFile && req.files.dbsCertificateFile[0]) {
        dbsCertificateUrl = '/uploads/freelancers/' + req.files.dbsCertificateFile[0].filename;
        dbsCertificateFileName = req.files.dbsCertificateFile[0].originalname;
      }
      if (req.files.cvFile && req.files.cvFile[0]) {
        cvUrl = '/uploads/freelancers/' + req.files.cvFile[0].filename;
        cvFileName = req.files.cvFile[0].originalname;
      }
    }
    const freelancer = new Freelancer({
      fullName: req.body.fullName,
      homeAddress: req.body.homeAddress,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      isOnWhatsApp: req.body.isOnWhatsApp,
      hasSocialWorkEnglandRegistration: req.body.hasSocialWorkEnglandRegistration,
      socialWorkEnglandRegistrationNumber: req.body.socialWorkEnglandRegistrationNumber,
      hasDBSCheck: req.body.hasDBSCheck,
      isOnUpdateSystem: req.body.isOnUpdateSystem,
      dbsCertificateUrl,
      dbsCertificateFileName,
      currentLocation: req.body.currentLocation,
      geographicalLocation: req.body.geographicalLocation,
      role: req.body.role,
      milesWillingToTravel: req.body.milesWillingToTravel,
      hasFormFAssessmentExperience: req.body.hasFormFAssessmentExperience,
      formFAssessmentExperienceYears: req.body.formFAssessmentExperienceYears,
      otherSocialWorkAssessmentExperience: req.body.otherSocialWorkAssessmentExperience,
      considerationFor: req.body.considerationFor,
      qualificationsAndTraining: req.body.qualificationsAndTraining,
      additionalInfo: req.body.additionalInfo,
      professionalReferences: req.body.professionalReferences,
      cvUrl,
      cvFileName,
      paymentPreferences: req.body.paymentPreferences,
      paymentOther: req.body.paymentOther,
      // Legacy fields
      name: req.body.name,
      roleLegacy: req.body.roleLegacy,
      status: req.body.status,
      availability: req.body.availability,
      skills: req.body.skills,
      complianceDocs: req.body.complianceDocs || [],
      assignments: req.body.assignments || [],
      contract_date: req.body.contractDate || null
    });
    await freelancer.save();
    // Mark token as used
    tokenDoc.used = true;
    await tokenDoc.save();
    res.json({ message: 'Freelancer submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit freelancer' });
  }
};

module.exports = {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
};
module.exports.sendFreelancerFormLink = sendFreelancerFormLink;
module.exports.submitFreelancerPublicForm = submitFreelancerPublicForm; 