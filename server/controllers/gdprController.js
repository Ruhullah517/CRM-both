const ConsentRecord = require('../models/ConsentRecord');
const DataRetention = require('../models/DataRetention');
const AuditLog = require('../models/AuditLog');
const Contact = require('../models/Contact');
const Enquiry = require('../models/Enquiry');
const Case = require('../models/Case');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all consent records for a contact
const getContactConsent = async (req, res) => {
  try {
    const { contactId } = req.params;
    const consentRecords = await ConsentRecord.find({ 
      contactId: contactId,
      isActive: true 
    }).sort({ givenAt: -1 });
    
    res.json(consentRecords);
  } catch (error) {
    console.error('Error fetching consent records:', error);
    res.status(500).json({ error: 'Failed to fetch consent records' });
  }
};

// Record consent
const recordConsent = async (req, res) => {
  try {
    const { 
      contactId, 
      contactEmail, 
      consentType, 
      consentGiven, 
      consentMethod, 
      consentText, 
      consentVersion,
      ipAddress,
      userAgent,
      metadata 
    } = req.body;
    
    // If consent is being withdrawn, mark existing records as inactive
    if (!consentGiven) {
      await ConsentRecord.updateMany(
        { 
          contactId: contactId, 
          consentType: consentType,
          isActive: true 
        },
        { 
          isActive: false,
          withdrawnAt: new Date(),
          withdrawalMethod: consentMethod,
          withdrawalReason: req.body.withdrawalReason || 'User requested'
        }
      );
    }
    
    const consentRecord = new ConsentRecord({
      contactId,
      contactEmail,
      consentType,
      consentGiven,
      consentMethod,
      consentText,
      consentVersion,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent'),
      givenAt: new Date(),
      metadata: metadata || {}
    });
    
    await consentRecord.save();
    
    res.status(201).json(consentRecord);
  } catch (error) {
    console.error('Error recording consent:', error);
    res.status(500).json({ error: 'Failed to record consent' });
  }
};

// Get data retention policies
const getDataRetentionPolicies = async (req, res) => {
  try {
    const policies = await DataRetention.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ entityType: 1 });
    
    res.json(policies);
  } catch (error) {
    console.error('Error fetching data retention policies:', error);
    res.status(500).json({ error: 'Failed to fetch data retention policies' });
  }
};

// Create or update data retention policy
const setDataRetentionPolicy = async (req, res) => {
  try {
    const { entityType, retentionPeriod, autoDelete, anonymizeBeforeDelete, legalBasis, description } = req.body;
    
    const policy = await DataRetention.findOneAndUpdate(
      { entityType: entityType },
      {
        entityType,
        retentionPeriod,
        autoDelete,
        anonymizeBeforeDelete,
        legalBasis,
        description,
        createdBy: req.user.id
      },
      { upsert: true, new: true, runValidators: true }
    );
    
    res.json(policy);
  } catch (error) {
    console.error('Error setting data retention policy:', error);
    res.status(500).json({ error: 'Failed to set data retention policy' });
  }
};

// Get audit logs with filtering
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      entityType, 
      riskLevel, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const query = {};
    
    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (riskLevel) query.riskLevel = riskLevel;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// Data export for GDPR (Right to Data Portability)
const exportUserData = async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Get all data related to this contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const enquiries = await Enquiry.find({ 
      $or: [
        { email_address: contact.email },
        { full_name: contact.name }
      ]
    });
    
    const cases = await Case.find({ 
      $or: [
        { contactEmail: contact.email },
        { contactName: contact.name }
      ]
    });
    
    const consentRecords = await ConsentRecord.find({ 
      contactId: contactId 
    });
    
    const auditLogs = await AuditLog.find({
      $or: [
        { entityId: contactId, entityType: 'contact' },
        { 'newValues.email': contact.email },
        { 'oldValues.email': contact.email }
      ]
    }).populate('userId', 'name email');
    
    const exportData = {
      contact: contact,
      enquiries: enquiries,
      cases: cases,
      consentRecords: consentRecords,
      auditLogs: auditLogs,
      exportDate: new Date(),
      exportReason: 'GDPR Data Portability Request'
    };
    
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
};

// Data anonymization for GDPR (Right to be Forgotten)
const anonymizeUserData = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { reason } = req.body;
    
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Anonymize contact data
    await Contact.findByIdAndUpdate(contactId, {
      name: 'ANONYMIZED',
      email: `anonymized_${contactId}@deleted.local`,
      phone: null,
      organizationName: null,
      organizationAddress: null,
      notes: 'Data anonymized per GDPR request',
      tags: [],
      interestAreas: [],
      communicationHistory: [],
      lastContactDate: null,
      nextFollowUpDate: null,
      updated_at: new Date()
    });
    
    // Anonymize enquiries
    await Enquiry.updateMany(
      { email_address: contact.email },
      {
        full_name: 'ANONYMIZED',
        email_address: `anonymized_${contactId}@deleted.local`,
        telephone: null,
        location: null,
        post_code: null,
        nationality: null,
        ethnicity: null,
        sexual_orientation: null,
        occupation: null,
        motivation: 'Data anonymized per GDPR request',
        support_needs: 'Data anonymized per GDPR request',
        notes: 'Data anonymized per GDPR request'
      }
    );
    
    // Anonymize cases
    await Case.updateMany(
      { contactEmail: contact.email },
      {
        contactName: 'ANONYMIZED',
        contactEmail: `anonymized_${contactId}@deleted.local`,
        contactPhone: null,
        notes: 'Data anonymized per GDPR request'
      }
    );
    
    // Mark consent records as withdrawn
    await ConsentRecord.updateMany(
      { contactId: contactId },
      {
        isActive: false,
        withdrawnAt: new Date(),
        withdrawalMethod: 'gdpr_request',
        withdrawalReason: reason || 'GDPR Right to be Forgotten'
      }
    );
    
    // Log the anonymization
    const auditLog = new AuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'data_anonymization',
      entityType: 'contact',
      entityId: contactId,
      entityName: contact.name,
      description: `Anonymized data for GDPR request: ${reason || 'Right to be Forgotten'}`,
      riskLevel: 'high',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionId || 'unknown'
    });
    
    await auditLog.save();
    
    res.json({ message: 'Data anonymized successfully' });
  } catch (error) {
    console.error('Error anonymizing user data:', error);
    res.status(500).json({ error: 'Failed to anonymize user data' });
  }
};

// Get data retention compliance report
const getComplianceReport = async (req, res) => {
  try {
    const policies = await DataRetention.find({ isActive: true });
    const report = [];
    
    for (const policy of policies) {
      const Model = getModelByEntityType(policy.entityType);
      if (!Model) continue;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
      
      const expiredRecords = await Model.countDocuments({
        createdAt: { $lt: cutoffDate }
      });
      
      const totalRecords = await Model.countDocuments();
      
      report.push({
        entityType: policy.entityType,
        retentionPeriod: policy.retentionPeriod,
        totalRecords: totalRecords,
        expiredRecords: expiredRecords,
        complianceRate: totalRecords > 0 ? ((totalRecords - expiredRecords) / totalRecords * 100).toFixed(2) : 100,
        needsAction: expiredRecords > 0 && policy.autoDelete
      });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ error: 'Failed to generate compliance report' });
  }
};

// Process data retention (delete/anonymize expired records)
const processDataRetention = async (req, res) => {
  try {
    const policies = await DataRetention.find({ 
      isActive: true, 
      autoDelete: true 
    });
    
    const results = [];
    
    for (const policy of policies) {
      const Model = getModelByEntityType(policy.entityType);
      if (!Model) continue;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriod);
      
      const expiredRecords = await Model.find({
        createdAt: { $lt: cutoffDate }
      });
      
      if (expiredRecords.length > 0) {
        if (policy.anonymizeBeforeDelete) {
          // Anonymize records
          const anonymizeData = getAnonymizeData(policy.entityType);
          await Model.updateMany(
            { _id: { $in: expiredRecords.map(r => r._id) } },
            anonymizeData
          );
        } else {
          // Delete records
          await Model.deleteMany({
            _id: { $in: expiredRecords.map(r => r._id) }
          });
        }
        
        results.push({
          entityType: policy.entityType,
          processedCount: expiredRecords.length,
          action: policy.anonymizeBeforeDelete ? 'anonymized' : 'deleted'
        });
      }
    }
    
    res.json({ 
      message: 'Data retention processing completed',
      results: results
    });
  } catch (error) {
    console.error('Error processing data retention:', error);
    res.status(500).json({ error: 'Failed to process data retention' });
  }
};

// Helper function to get model by entity type
const getModelByEntityType = (entityType) => {
  const models = {
    contact: Contact,
    enquiry: Enquiry,
    case: Case,
    user: User
  };
  return models[entityType];
};

// Helper function to get anonymize data for entity type
const getAnonymizeData = (entityType) => {
  const anonymizeData = {
    contact: {
      name: 'ANONYMIZED',
      email: 'anonymized@deleted.local',
      phone: null,
      organizationName: null,
      organizationAddress: null,
      notes: 'Data anonymized per retention policy'
    },
    enquiry: {
      full_name: 'ANONYMIZED',
      email_address: 'anonymized@deleted.local',
      telephone: null,
      location: null,
      post_code: null,
      nationality: null,
      ethnicity: null,
      sexual_orientation: null,
      occupation: null,
      motivation: 'Data anonymized per retention policy',
      support_needs: 'Data anonymized per retention policy'
    },
    case: {
      contactName: 'ANONYMIZED',
      contactEmail: 'anonymized@deleted.local',
      contactPhone: null,
      notes: 'Data anonymized per retention policy'
    }
  };
  
  return anonymizeData[entityType] || {};
};

module.exports = {
  getContactConsent,
  recordConsent,
  getDataRetentionPolicies,
  setDataRetentionPolicy,
  getAuditLogs,
  exportUserData,
  anonymizeUserData,
  getComplianceReport,
  processDataRetention
};
