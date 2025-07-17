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

// Map incoming WordPress field keys to backend field names
function mapWordpressFields(data) {
  return {
    // Carer Details
    carerName: data['fields.field_8dba340.raw_value'], // Carer Name
    carerEmail: data['fields.field_fa8987e.raw_value'], // Carer Email
    carerContactNumber: data['fields.field_6dbbe13.raw_value'], // Carer Contact Number

    // Referrer Details
    referrerName: data['fields.name.raw_value'], // Referrer Name
    organization: data['fields.field_cc2e080.raw_value'], // Organization

    // SSW (Supervising Social Worker) Details
    sswName: data['fields.field_600bb55.raw_value'], // SSW Name
    sswContactNumber: data['fields.field_6834ad2.raw_value'], // SSW Contact Number
    sswEmail: data['fields.field_7e24913.raw_value'], // SSW Email
    sswLocalAuthority: data['fields.field_d51e22d.raw_value'], // SSW Local Authority

    // Decision Maker Details
    decisionMakerName: data['fields.field_0640e53.raw_value'], // Decision Maker Name
    decisionMakerContactNumber: data['fields.field_8cff087.raw_value'], // Decision Maker Contact Number
    decisionMakerEmail: data['fields.field_a52aea1.raw_value'], // Decision Maker Email

    // Finance Contact
    financeContactName: data['fields.field_50fcec2.raw_value'], // Finance Contact Name
    financeContactNumber: data['fields.field_8cff087.raw_value'], // Finance Contact Number
    financeEmail: data['fields.field_a52aea1.raw_value'], // Finance Email

    // Case Information
    presentingIssues: data['fields.field_8273cb2.raw_value'], // Presenting Issues
    notes: data['fields.field_71586e4.raw_value'], // Notes / Case Summary
  };
}

const createCaseFromReferral = async (req, res) => {
  try {
    const rawData = req.body; // The actual data object from WordPress
    const mappedData = mapWordpressFields(rawData);
    const caseData = transformWebsiteReferral(mappedData);
    const caseItem = new Case(caseData);
    await caseItem.save();
    res.status(201).json({ id: caseItem._id, msg: 'Case created from referral' });
  } catch (error) {
    console.error('Error creating case from referral:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { createCaseFromReferral }; 