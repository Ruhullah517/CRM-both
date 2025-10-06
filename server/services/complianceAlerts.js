const Freelancer = require('../models/Freelancer');
const { sendMail } = require('../utils/mailer');

// Check for expiring compliance documents and send alerts
const checkExpiringCompliance = async () => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find freelancers with expiring documents
    const freelancers = await Freelancer.find({
      'complianceDocuments.expiryDate': { 
        $lte: thirtyDaysFromNow,
        $gte: now 
      }
    });

    const alerts = [];

    for (const freelancer of freelancers) {
      for (const doc of freelancer.complianceDocuments) {
        if (doc.expiryDate && doc.expiryDate >= now && doc.expiryDate <= thirtyDaysFromNow) {
          const daysUntilExpiry = Math.ceil((doc.expiryDate - now) / (1000 * 60 * 60 * 24));
          
          // Determine alert level
          let alertLevel = 'warning';
          if (daysUntilExpiry <= 7) {
            alertLevel = 'urgent';
          } else if (daysUntilExpiry <= 14) {
            alertLevel = 'high';
          }

          alerts.push({
            freelancerId: freelancer._id,
            freelancerName: freelancer.fullName,
            freelancerEmail: freelancer.email,
            documentName: doc.name,
            documentType: doc.type,
            expiryDate: doc.expiryDate,
            daysUntilExpiry,
            alertLevel,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName
          });
        }
      }
    }

    // Send email alerts for urgent items (7 days or less)
    const urgentAlerts = alerts.filter(alert => alert.alertLevel === 'urgent');
    if (urgentAlerts.length > 0) {
      await sendComplianceAlertEmail(urgentAlerts, 'urgent');
    }

    // Send email alerts for high priority items (14 days or less)
    const highAlerts = alerts.filter(alert => alert.alertLevel === 'high');
    if (highAlerts.length > 0) {
      await sendComplianceAlertEmail(highAlerts, 'high');
    }

    return alerts;
  } catch (error) {
    console.error('Error checking expiring compliance:', error);
    throw error;
  }
};

// Send compliance alert email
const sendComplianceAlertEmail = async (alerts, priority) => {
  try {
    const priorityText = priority === 'urgent' ? 'URGENT' : 'HIGH PRIORITY';
    const subject = `🚨 ${priorityText} - Compliance Documents Expiring Soon`;
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${priority === 'urgent' ? '#dc2626' : '#f59e0b'};">
          ${priorityText} - Compliance Documents Expiring Soon
        </h2>
        <p>The following compliance documents are expiring soon and require immediate attention:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Freelancer</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Document</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Type</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Expires</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Days Left</th>
            </tr>
          </thead>
          <tbody>
    `;

    alerts.forEach(alert => {
      htmlContent += `
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.freelancerName}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.documentName}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.documentType}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.expiryDate.toLocaleDateString()}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px; color: ${alert.daysUntilExpiry <= 7 ? '#dc2626' : '#f59e0b'};">
            ${alert.daysUntilExpiry} days
          </td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        
        <p><strong>Action Required:</strong></p>
        <ul>
          <li>Contact freelancers to renew expiring documents</li>
          <li>Update document expiry dates in the system</li>
          <li>Ensure all compliance requirements are met</li>
        </ul>
        
        <p>Please log into the HR Module to manage these compliance items.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated alert from the Black Foster Carers Alliance CRM system.
        </p>
      </div>
    `;

    // Send to admin email (you can configure this)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackfostercarersalliance.co.uk';
    
    await sendMail({
      to: adminEmail,
      subject: subject,
      html: htmlContent,
      hasHtml: true
    });

    console.log(`Compliance alert email sent for ${alerts.length} ${priority} items`);
  } catch (error) {
    console.error('Error sending compliance alert email:', error);
  }
};

// Check for expiring contracts and send alerts
const checkExpiringContracts = async () => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Find freelancers with expiring contracts
    const freelancers = await Freelancer.find({
      contractRenewalDate: { 
        $lte: thirtyDaysFromNow,
        $gte: now 
      }
    });

    const alerts = [];

    for (const freelancer of freelancers) {
      if (freelancer.contractRenewalDate) {
        const daysUntilExpiry = Math.ceil((freelancer.contractRenewalDate - now) / (1000 * 60 * 60 * 24));
        
        // Determine alert level
        let alertLevel = 'warning';
        if (daysUntilExpiry <= 7) {
          alertLevel = 'urgent';
        } else if (daysUntilExpiry <= 14) {
          alertLevel = 'high';
        }

        alerts.push({
          freelancerId: freelancer._id,
          freelancerName: freelancer.fullName,
          freelancerEmail: freelancer.email,
          contractRenewalDate: freelancer.contractRenewalDate,
          contractStatus: freelancer.contractStatus,
          daysUntilExpiry,
          alertLevel
        });
      }
    }

    // Send email alerts for urgent items (7 days or less)
    const urgentAlerts = alerts.filter(alert => alert.alertLevel === 'urgent');
    if (urgentAlerts.length > 0) {
      await sendContractAlertEmail(urgentAlerts, 'urgent');
    }

    // Send email alerts for high priority items (14 days or less)
    const highAlerts = alerts.filter(alert => alert.alertLevel === 'high');
    if (highAlerts.length > 0) {
      await sendContractAlertEmail(highAlerts, 'high');
    }

    return alerts;
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
    throw error;
  }
};

// Send contract alert email
const sendContractAlertEmail = async (alerts, priority) => {
  try {
    const priorityText = priority === 'urgent' ? 'URGENT' : 'HIGH PRIORITY';
    const subject = `🚨 ${priorityText} - Contracts Expiring Soon`;
    
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${priority === 'urgent' ? '#dc2626' : '#f59e0b'};">
          ${priorityText} - Contracts Expiring Soon
        </h2>
        <p>The following freelancer contracts are expiring soon and require immediate attention:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Freelancer</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Contract Status</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Expires</th>
              <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Days Left</th>
            </tr>
          </thead>
          <tbody>
    `;

    alerts.forEach(alert => {
      htmlContent += `
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.freelancerName}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.contractStatus}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px;">${alert.contractRenewalDate.toLocaleDateString()}</td>
          <td style="border: 1px solid #d1d5db; padding: 8px; color: ${alert.daysUntilExpiry <= 7 ? '#dc2626' : '#f59e0b'};">
            ${alert.daysUntilExpiry} days
          </td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
        
        <p><strong>Action Required:</strong></p>
        <ul>
          <li>Contact freelancers to renew contracts</li>
          <li>Update contract renewal dates in the system</li>
          <li>Ensure all contract requirements are met</li>
        </ul>
        
        <p>Please log into the HR Module to manage these contract renewals.</p>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated alert from the Black Foster Carers Alliance CRM system.
        </p>
      </div>
    `;

    // Send to admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@blackfostercarersalliance.co.uk';
    
    await sendMail({
      to: adminEmail,
      subject: subject,
      html: htmlContent,
      hasHtml: true
    });

    console.log(`Contract alert email sent for ${alerts.length} ${priority} items`);
  } catch (error) {
    console.error('Error sending contract alert email:', error);
  }
};

// Run all compliance checks
const runComplianceChecks = async () => {
  try {
    console.log('Running compliance checks...');
    
    const [complianceAlerts, contractAlerts] = await Promise.all([
      checkExpiringCompliance(),
      checkExpiringContracts()
    ]);

    console.log(`Compliance check completed: ${complianceAlerts.length} compliance alerts, ${contractAlerts.length} contract alerts`);
    
    return {
      complianceAlerts,
      contractAlerts,
      totalAlerts: complianceAlerts.length + contractAlerts.length
    };
  } catch (error) {
    console.error('Error running compliance checks:', error);
    throw error;
  }
};

module.exports = {
  checkExpiringCompliance,
  checkExpiringContracts,
  runComplianceChecks,
  sendComplianceAlertEmail,
  sendContractAlertEmail
};
