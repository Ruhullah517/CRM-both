const Freelancer = require('../models/Freelancer');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const FreelancerFormToken = require('../models/FreelancerFormToken');
const Contact = require('../models/Contact');
const { getEmailContainer } = require('../utils/emailTemplates');
const path = require('path');

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
    await createOrUpdateContactFromFreelancer(freelancer);
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
      from: 'Black Foster Carers Alliance <ruhullah517@gmail.com>',
      to: email,
      subject: 'Complete Your Freelancer Form – BFCA',
      html: getEmailContainer(`
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #cce5ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #004085; margin: 0 0 10px 0; font-size: 24px;">👋 Welcome to Black Foster Carers Alliance</h2>
            <p style="color: #004085; margin: 0; font-size: 16px;">Thank you for your interest in working with us!</p>
          </div>
        </div>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📝 Complete Your Registration</h3>
          <p style="color: #666; margin: 0 0 15px 0;">To move forward with your application, please complete our freelancer registration form using the link below:</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${link}" style="background: #2EAB2C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              📋 Complete Freelancer Form
            </a>
          </div>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <h4 style="color: #856404; margin: 0 0 10px 0;">ℹ️ What Happens Next?</h4>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Complete the registration form with your details</li>
            <li>Upload required documents (DBS certificate, CV)</li>
            <li>Submit your application</li>
            <li>Our team will review and contact you with next steps</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; margin: 0 0 15px 0;">If you have any questions, please don't hesitate to contact us.</p>
          <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Team</p>
        </div>
      `),
      attachments: [
        {
          filename: 'logo.jpg',
          path: path.join(__dirname, '..', '..', 'client', 'public', 'img1.jpg'),
          cid: 'company-logo'
        }
      ]
    });

    res.json({ message: 'Form link sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send form link' });
  }
};

async function createOrUpdateContactFromFreelancer(freelancer) {
  if (!freelancer.email) return;
  let contact = await Contact.findOne({ email: freelancer.email });
  if (!contact) {
    contact = new Contact({
      name: freelancer.fullName || freelancer.name,
      email: freelancer.email,
      phone: freelancer.mobileNumber,
      tags: ['Freelancer'],
      notes: '',
      organizationName: '',
      organizationAddress: '',
      communicationHistory: [],
      // user_id is intentionally omitted
    });
  } else {
    if (!contact.tags.includes('Freelancer')) {
      contact.tags.push('Freelancer');
    }
    if (!contact.name && (freelancer.fullName || freelancer.name)) contact.name = freelancer.fullName || freelancer.name;
    if (!contact.phone && freelancer.mobileNumber) contact.phone = freelancer.mobileNumber;
  }
  await contact.save();
}

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
    await createOrUpdateContactFromFreelancer(freelancer);
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