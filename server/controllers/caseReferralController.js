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
    referralSource: data.referrerName || '', // Only use referrerName
    organization: data.organization || '',   // Store organization separately
    referrerContactNumber: data.contactNumber || '',
    referrerEmail: data.emailAddress || '',
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
    // Referrer Details
    referrerName: data['fields.name.raw_value'],
    position: data['fields.field_81b3283.raw_value'],
    organization: data['fields.email.raw_value'],
    contactNumber: data['fields.field_2a317f5.raw_value'],
    emailAddress: data['fields.field_236cc38.raw_value'],
    serviceType: data['fields.field_423164f.raw_value'],
    hours: data['fields.field_516bfb9.raw_value'],
    referralDetails: data['fields.field_8273cb2.raw_value'],

    // Carer Details
    carerName: data['fields.field_600bb55.raw_value'],
    carerContactNumber: data['fields.field_6dbbe13.raw_value'],
    carerEmail: data['fields.field_fa8987e.raw_value'],
    carerType: data['fields.field_74a621c.raw_value'],

    // SSW
    sswName: data['fields.field_8dba340.raw_value'],
    sswContactNumber: data['fields.field_6834ad2.raw_value'],
    sswEmail: data['fields.field_7e24913.raw_value'],
    sswLocalAuthority: data['fields.field_d51e22d.raw_value'],

    // Decision Maker
    decisionMakerName: data['fields.field_d9861e8.raw_value'],
    decisionMakerContactNumber: data['fields.field_8cff087.raw_value'],
    decisionMakerEmail: data['fields.field_a52aea1.raw_value'],

    // Finance Contact
    financeContactName: data['fields.field_cc2e080.raw_value'],
    financeContactNumber: data['fields.field_50fcec2.raw_value'],
    financeEmail: data['fields.field_0640e53.raw_value'],

    // Additional Info
    otherConsideration: data['fields.field_71586e4.raw_value'],
  };
}

const createCaseFromReferral = async (req, res) => {
  try {
    const rawData = req.body; // The actual data object from WordPress
    const mappedData = mapWordpressFields(rawData);
    const caseData = transformWebsiteReferral(mappedData);
    console.log(req.body);
    const caseItem = new Case(caseData);
    await caseItem.save();
    res.status(201).json({ id: caseItem._id, msg: 'Case created from referral', data: req.body });
  } catch (error) {
    console.error('Error creating case from referral:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { createCaseFromReferral }; 