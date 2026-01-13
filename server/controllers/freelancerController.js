const Freelancer = require('../models/Freelancer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { sendMail, getFromAddress } = require('../utils/mailer');
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

// Get a single freelancer by email
const getFreelancerByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const f = await Freelancer.findOne({ email: email });
    if (!f) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json({ ...f.toObject(), contractDate: f.contract_date });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

function parseArrayField(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    if (val.startsWith('[')) {
      try { return JSON.parse(val); } catch (e) { return []; }
    }
    // comma separated fallback
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

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
      roles: parseArrayField(req.body.roles),

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
      roles: parseArrayField(req.body.roles),

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
    const { getFrontendUrl } = require('../config/urls');
    const rawFrontendUrl = getFrontendUrl();
    // Ensure no trailing slash to avoid double slashes in generated links
    const frontendUrl = rawFrontendUrl.replace(/\/+$/, '');
    const link = `${frontendUrl}/freelancer-form/${token}`;
    await FreelancerFormToken.create({ email, token });

    await sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Complete Your Freelancer Form – BFCA',
      html: getEmailContainer(`
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #e8f7e8; border: 1px solid #2EAB2C; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #1a7a1a; margin: 0 0 10px 0; font-size: 24px;">👋 Welcome to Black Foster Carers Alliance</h2>
            <p style="color: #1a7a1a; margin: 0; font-size: 16px;">Thank you for your interest in working with us!</p>
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
          filename: 'logo-white.png',
          path: path.join(__dirname, '..', '..', 'client', 'public', 'logo-white.png'),
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
      contactType: 'freelancer',
      // Mark where this contact originated from for Sales & Communication source filters
      leadSource: 'freelancer',
      notes: '',
      organizationName: '',
      organizationAddress: '',
      communicationHistory: [],
      // user_id is intentionally omitted
    });
  } else {
    if (!contact.tags.includes('Freelancer')) contact.tags.push('Freelancer');
    if (!contact.leadSource) contact.leadSource = 'freelancer';
    if (!contact.contactType || contact.contactType === 'prospect') contact.contactType = 'freelancer';
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

// Update freelancer availability
const updateAvailability = async (req, res) => {
  try {
    console.log('=== updateAvailability ROUTE CALLED (ADMIN) ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    const { hourlyRate, dailyRate, availability, availabilityNotes } = req.body;
    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { hourlyRate, dailyRate, availability, availabilityNotes, updated_at: new Date() },
      { new: true }
    );
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update my own availability (for freelancers)
const updateMyAvailability = async (req, res) => {
  try {
    console.log('=== updateMyAvailability ROUTE CALLED ===');
    console.log('updateMyAvailability called with:', req.body);
    console.log('User:', req.user);
    
    const { availability, availabilityNotes } = req.body;
    const userEmail = req.user.email;
    
    console.log('Looking for freelancer with email:', userEmail);
    
    // Find freelancer by email
    const freelancer = await Freelancer.findOne({ email: userEmail });
    if (!freelancer) {
      console.log('Freelancer not found for email:', userEmail);
      return res.status(404).json({ msg: 'Freelancer profile not found' });
    }
    
    console.log('Found freelancer:', freelancer.fullName);
    
    // Update availability using findByIdAndUpdate to bypass validation
    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      freelancer._id,
      {
        availability,
        availabilityNotes,
        updated_at: new Date()
      },
      { new: true, runValidators: false }
    );
    
    console.log('Availability updated successfully');
    res.json(updatedFreelancer);
  } catch (error) {
    console.error('Error updating my availability:', error);
    res.status(500).json({ msg: 'Server error: ' + error.message });
  }
};

// Add compliance document
const addComplianceDocument = async (req, res) => {
  try {
    const { name, type, expiryDate } = req.body;
    let fileUrl = req.body.fileUrl;
    let fileName = req.body.fileName;

    if (req.files && req.files.complianceFile && req.files.complianceFile[0]) {
      fileUrl = '/uploads/freelancers/compliance/' + req.files.complianceFile[0].filename;
      fileName = req.files.complianceFile[0].originalname;
    }

    const document = {
      name,
      type,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      fileUrl,
      fileName
    };

    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { $push: { complianceDocuments: document }, updated_at: new Date() },
      { new: true }
    );
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete compliance document
const deleteComplianceDocument = async (req, res) => {
  try {
    const { id, documentIndex } = req.params;
    
    const freelancer = await Freelancer.findById(id);
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    
    if (!freelancer.complianceDocuments || freelancer.complianceDocuments.length <= documentIndex) {
      return res.status(404).json({ msg: 'Document not found' });
    }
    
    // Remove the document at the specified index
    freelancer.complianceDocuments.splice(documentIndex, 1);
    freelancer.updated_at = new Date();
    
    // Save without validation to avoid enum issues with existing data
    await freelancer.save({ validateBeforeSave: false });
    res.json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Add work history entry
const addWorkHistory = async (req, res) => {
  try {
    const { assignment, startDate, endDate, hours, rate, notes } = req.body;
    const totalAmount = hours * rate;

    const workEntry = {
      assignment,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      hours,
      rate,
      totalAmount,
      status: endDate ? 'completed' : 'in_progress',
      notes
    };

    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { $push: { workHistory: workEntry }, updated_at: new Date() },
      { new: true }
    );
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update work history entry
const updateWorkHistory = async (req, res) => {
  try {
    const { workIndex } = req.params;
    const { assignment, startDate, endDate, hours, rate, notes, status } = req.body;
    
    // Calculate total amount
    const totalAmount = hours * rate;
    
    // Prepare the updated work entry
    const updatedWorkEntry = {
      assignment,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      hours,
      rate,
      totalAmount,
      status: status || (endDate ? 'completed' : 'in_progress'),
      notes
    };
    
    // Use findByIdAndUpdate with array element update to avoid full document validation
    const updateQuery = {};
    updateQuery[`workHistory.${workIndex}`] = updatedWorkEntry;
    updateQuery.updated_at = new Date();
    
    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { $set: updateQuery },
      { new: true, runValidators: false } // Skip validation to avoid issues with other fields
    );
    
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    
    res.json(freelancer);
  } catch (error) {
    console.error('Update work history error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Delete work history entry
const deleteWorkHistory = async (req, res) => {
  try {
    const { workIndex } = req.params;
    
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    
    if (!freelancer.workHistory || !freelancer.workHistory[workIndex]) {
      return res.status(404).json({ msg: 'Work history entry not found' });
    }

    // Remove the work history entry using $pull with position
    // Since we can't directly remove by index, we need to use a different approach
    const workHistoryCopy = [...freelancer.workHistory];
    workHistoryCopy.splice(parseInt(workIndex), 1);
    
    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          workHistory: workHistoryCopy,
          updated_at: new Date() 
        }
      },
      { new: true, runValidators: false }
    );
    
    res.json(updatedFreelancer);
  } catch (error) {
    console.error('Delete work history error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Get compliance documents expiring soon
const getExpiringCompliance = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const freelancers = await Freelancer.find({
      'complianceDocuments.expiryDate': { $lte: futureDate, $gte: new Date() }
    }).select('fullName email complianceDocuments');

    const expiringDocs = [];
    freelancers.forEach(freelancer => {
      freelancer.complianceDocuments.forEach(doc => {
        if (doc.expiryDate && doc.expiryDate <= futureDate && doc.expiryDate >= new Date()) {
          expiringDocs.push({
            freelancerId: freelancer._id,
            freelancerName: freelancer.fullName,
            freelancerEmail: freelancer.email,
            documentName: doc.name,
            documentType: doc.type,
            expiryDate: doc.expiryDate,
            daysUntilExpiry: Math.ceil((doc.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
          });
        }
      });
    });

    res.json(expiringDocs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update contract renewal date
const updateContractRenewal = async (req, res) => {
  try {
    const { contractRenewalDate, contractStatus } = req.body;
    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      { 
        contractRenewalDate: contractRenewalDate ? new Date(contractRenewalDate) : null,
        contractStatus: contractStatus || 'active',
        updated_at: new Date() 
      },
      { new: true }
    );
    if (!freelancer) return res.status(404).json({ msg: 'Freelancer not found' });
    res.json(freelancer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Helper function to generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Create user account for freelancer
const createUserAccountForFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.id;
    const freelancer = await Freelancer.findById(freelancerId);
    
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    if (!freelancer.email) {
      return res.status(400).json({ error: 'Freelancer must have an email address' });
    }

    // Check if user account already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: freelancer.email },
        { freelancerId: freelancerId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User account already exists for this freelancer',
        userId: existingUser._id 
      });
    }

    // Generate random password
    const generatedPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user account
    const newUser = new User({
      name: freelancer.fullName,
      email: freelancer.email,
      password: hashedPassword,
      role: 'freelancer',
      freelancerId: freelancerId,
      created_at: new Date(),
      updated_at: new Date()
    });

    await newUser.save();

    // Send email with credentials
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2EAB2C 0%, #1a7d1a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #2EAB2C; margin: 20px 0; border-radius: 4px; }
            .button { display: inline-block; padding: 12px 30px; background: #2EAB2C; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to BFCA CRM!</h1>
              <p>Your freelancer account has been approved</p>
            </div>
            <div class="content">
              <p>Hello <strong>${freelancer.fullName}</strong>,</p>
              <p>Great news! Your freelancer application has been approved and you now have access to the BFCA CRM system.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0; color: #2EAB2C;">Your Login Credentials</h3>
                <p><strong>Email:</strong> ${freelancer.email}</p>
                <p><strong>Password:</strong> <code style="background: #e8f7e8; color: #1a7a1a; padding: 5px 10px; border-radius: 3px;">${generatedPassword}</code></p>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security.
              </div>

              <p><strong>What you can do in the portal:</strong></p>
              <ul>
                <li>Update your profile and contact information</li>
                <li>Manage your availability status</li>
                <li>Upload and renew compliance documents</li>
                <li>View your work history and assignments</li>
              </ul>

              <a href="${process.env.FRONTEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'http://crm.blackfostercarersalliance.co.uk')}" class="button" style="color: white;">Login to CRM</a>

              <p style="margin-top: 30px;">If you have any questions, please contact our HR team.</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} BFCA. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendMail({
        from: getFromAddress(),
        to: freelancer.email,
        subject: 'Welcome to BFCA CRM - Your Login Credentials',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      // Don't fail the whole operation if email fails
    }

    res.json({ 
      success: true, 
      userId: newUser._id,
      message: 'User account created successfully',
      credentials: {
        email: freelancer.email,
        password: generatedPassword // Only send in response for admin to see
      }
    });
  } catch (error) {
    console.error('Error creating user account:', error);
    res.status(500).json({ error: error.message });
  }
};





module.exports = {
  getAllFreelancers,
  getFreelancerById,
  getFreelancerByEmail,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
  updateAvailability,
  updateMyAvailability,
  addComplianceDocument,
  deleteComplianceDocument,
  addWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  getExpiringCompliance,
  updateContractRenewal,
  createUserAccountForFreelancer,
};
module.exports.sendFreelancerFormLink = sendFreelancerFormLink;
module.exports.submitFreelancerPublicForm = submitFreelancerPublicForm; 