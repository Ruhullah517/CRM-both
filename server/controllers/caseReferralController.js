const Case = require('../models/Case');
const { v4: uuidv4 } = require('uuid');

// Map incoming website fields to Case schema fields
function transformWebsiteReferral(data) {
  return {
    caseReferenceNumber: 'CASE-' + uuidv4().split('-')[0].toUpperCase(),
    clientFullName: data.carerName || data.clientFullName || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    ethnicity: data.ethnicity || '',
    contactInfo: {
      email: data.carerEmail || data.emailAddress || '',
      phone: data.carerContactNumber || data.contactNumber || ''
    },
    address: data.address || '',
    referralSource: data.organization || data.referrerName || '',
    caseType: data.serviceType || data.carerType || '',
    presentingIssues: data.referralDetails || '',
    assignedCaseworkers: [],
    riskLevel: 'Medium', // or 'High'
    keyDates: { opened: new Date() },
    status: 'Awaiting Assessment',
    notes: data.otherConsideration || '',
    outcomeAchieved: '',
    supportingDocuments: [],
    totalTimeLogged: '00:00',
    invoiceableHours: '00:00',
    referralDetails: {
      position: data.position || '',
      hours: data.hours || '',
      sswName: data.sswName || '',
      sswContactNumber: data.sswContactNumber || '',
      sswEmail: data.sswEmail || '',
      sswLocalAuthority: data.sswLocalAuthority || '',
      decisionMakerName: data.decisionMakerName || '',
      decisionMakerContactNumber: data.decisionMakerContactNumber || '',
      decisionMakerEmail: data.decisionMakerEmail || '',
      financeContactName: data.financeContactName || '',
      financeContactNumber: data.financeContactNumber || '',
      financeEmail: data.financeEmail || ''
    }
  };
}

const createCaseFromReferral = async (req, res) => {
  try {
    const referralData = req.body;
    console.log(req.body);
    res.json({data: req.body})
    const caseData = transformWebsiteReferral(referralData);
    const caseItem = new Case(caseData);
    // await caseItem.save();
    // res.status(201).json({ id: caseItem._id, msg: 'Case created from referral', bdy: req.body });
  } catch (error) {
    console.error('Error creating case from referral:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { createCaseFromReferral }; 