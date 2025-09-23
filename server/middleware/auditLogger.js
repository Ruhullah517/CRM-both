const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

// Middleware to log API requests
const auditLogger = (action, entityType, getEntityId = null, getEntityName = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Generate session ID if not exists
    if (!req.sessionId) {
      req.sessionId = uuidv4();
    }
    
    // Override res.send to capture response
    res.send = function(data) {
      logAuditEvent(req, res, action, entityType, getEntityId, getEntityName, data);
      return originalSend.call(this, data);
    };
    
    res.json = function(data) {
      logAuditEvent(req, res, action, entityType, getEntityId, getEntityName, data);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Log audit event
const logAuditEvent = async (req, res, action, entityType, getEntityId, getEntityName, responseData) => {
  try {
    // Skip logging for certain actions or if no user
    if (!req.user || shouldSkipLogging(req, action)) {
      return;
    }
    
    const entityId = getEntityId ? getEntityId(req, res) : req.params.id;
    const entityName = getEntityName ? getEntityName(req, res) : null;
    
    // Determine risk level based on action and entity type
    const riskLevel = determineRiskLevel(action, entityType, req);
    
    // Extract metadata
    const metadata = extractMetadata(req);
    
    const auditLog = new AuditLog({
      userId: req.user.id || req.user._id,
      userEmail: req.user.email,
      action: action,
      entityType: entityType,
      entityId: entityId,
      entityName: entityName,
      oldValues: req.oldValues || null,
      newValues: req.newValues || null,
      ipAddress: getClientIP(req),
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionId,
      description: generateDescription(action, entityType, entityName, req),
      riskLevel: riskLevel,
      metadata: metadata
    });
    
    await auditLog.save();
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Don't throw error to avoid breaking the main request
  }
};

// Determine if logging should be skipped
const shouldSkipLogging = (req, action) => {
  const skipActions = ['read', 'login'];
  const skipPaths = ['/api/health', '/api/status'];
  
  return skipActions.includes(action) || skipPaths.includes(req.path);
};

// Determine risk level
const determineRiskLevel = (action, entityType, req) => {
  const highRiskActions = ['delete', 'bulk_delete', 'password_change', 'role_change', 'permission_change'];
  const highRiskEntities = ['user', 'audit_log'];
  const criticalActions = ['bulk_delete', 'role_change', 'permission_change'];
  
  if (criticalActions.includes(action) || highRiskEntities.includes(entityType)) {
    return 'critical';
  }
  
  if (highRiskActions.includes(action)) {
    return 'high';
  }
  
  if (action === 'update' || action === 'create') {
    return 'medium';
  }
  
  return 'low';
};

// Extract metadata from request
const extractMetadata = (req) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Simple user agent parsing
  const browser = extractBrowser(userAgent);
  const os = extractOS(userAgent);
  const device = extractDevice(userAgent);
  
  return {
    browser: browser,
    os: os,
    device: device,
    referrer: req.get('Referer') || null
  };
};

// Extract browser from user agent
const extractBrowser = (userAgent) => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

// Extract OS from user agent
const extractOS = (userAgent) => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

// Extract device type from user agent
const extractDevice = (userAgent) => {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
};

// Get client IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown';
};

// Generate human-readable description
const generateDescription = (action, entityType, entityName, req) => {
  const actionMap = {
    create: 'Created',
    read: 'Viewed',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
    logout: 'Logged out',
    password_change: 'Changed password',
    export: 'Exported data',
    import: 'Imported data',
    bulk_update: 'Bulk updated',
    bulk_delete: 'Bulk deleted',
    email_sent: 'Sent email',
    file_upload: 'Uploaded file',
    file_download: 'Downloaded file',
    permission_change: 'Changed permissions',
    role_change: 'Changed role',
    data_export: 'Exported data',
    data_import: 'Imported data'
  };
  
  const entityMap = {
    user: 'user',
    contact: 'contact',
    enquiry: 'enquiry',
    case: 'case',
    contract: 'contract',
    freelancer: 'freelancer',
    mentor: 'mentor',
    training: 'training event',
    invoice: 'invoice',
    email: 'email',
    email_template: 'email template',
    reminder: 'reminder',
    audit_log: 'audit log'
  };
  
  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;
  const nameText = entityName ? ` "${entityName}"` : '';
  
  return `${actionText} ${entityText}${nameText}`;
};

// Middleware to capture old values for updates
const captureOldValues = (entityType, getEntity) => {
  return async (req, res, next) => {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      try {
        const entityId = req.params.id;
        const oldEntity = await getEntity(entityId);
        req.oldValues = oldEntity ? oldEntity.toObject() : null;
      } catch (error) {
        console.error('Error capturing old values:', error);
      }
    }
    next();
  };
};

// Middleware to capture new values for updates
const captureNewValues = (req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH') {
    req.newValues = req.body;
  }
  next();
};

module.exports = {
  auditLogger,
  captureOldValues,
  captureNewValues
};
