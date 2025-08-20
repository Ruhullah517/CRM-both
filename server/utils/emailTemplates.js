// Email template helper functions with branding

const getEmailHeader = () => {
  return `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; min-width: 80px; min-height: 60px;">
          <!-- Logo will be embedded as attachment and referenced here -->
          <img src="cid:company-logo" 
               alt="Black Foster Carers Alliance Logo" 
               style="max-height: 60px; max-width: 120px; height: auto; width: auto; display: block; border: 0;" 
               width="60" height="60" />
        </div>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">BLACK FOSTER CARERS</h1>
      <h2 style="color: white; margin: 5px 0 0; font-size: 32px; font-weight: bold;">ALLIANCE</h2>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">Training & Development Services</p>
    </div>
  `;
};

const getEmailFooter = () => {
  return `
    <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 20px;">
      <div style="border-top: 2px solid #dee2e6; padding-top: 20px;">
        <p style="color: #6c757d; margin: 5px 0; font-size: 14px;">
          <strong>Black Foster Carers Alliance</strong><br>
        </p>
        <p style="color: #6c757d; margin: 5px 0; font-size: 12px;">
          Email: rachel@blackfostercarersalliance.co.uk<br>
          Website: www.blackfostercarersalliance.co.uk
        </p>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 11px; margin: 0;">
            This email was sent from the Black Foster Carers Alliance CRM System
          </p>
        </div>
      </div>
    </div>
  `;
};

const getEmailContainer = (content) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${getEmailHeader()}
      <div style="padding: 30px;">
        ${content}
      </div>
      ${getEmailFooter()}
    </div>
  `;
};

const getBookingConfirmationContent = (booking, trainingEvent) => {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 24px;">✓ Training Registration Confirmed</h2>
        <p style="color: #155724; margin: 0; font-size: 16px;">Your training registration has been successfully confirmed!</p>
      </div>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📅 Event Details</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Event:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold;">${trainingEvent.title}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Booking Reference:</strong></p>
          <p style="margin: 5px 0; color: #333; font-family: monospace;">${booking._id}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Date:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(trainingEvent.startDate).toLocaleDateString()} - ${new Date(trainingEvent.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Time:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(trainingEvent.startDate).toLocaleTimeString()} - ${new Date(trainingEvent.endDate).toLocaleTimeString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Location:</strong></p>
          <p style="margin: 5px 0; color: #333;">${trainingEvent.location || 'To be confirmed'}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Amount:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold;">${trainingEvent.price > 0 ? `£${trainingEvent.price} ${trainingEvent.currency}` : 'Free'}</p>
        </div>
      </div>
      ${trainingEvent.virtualMeetingLink ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
          <p style="margin: 5px 0; color: #666;"><strong>Virtual Meeting Link:</strong></p>
          <a href="${trainingEvent.virtualMeetingLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">${trainingEvent.virtualMeetingLink}</a>
        </div>
      ` : ''}
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #856404; margin: 0 0 10px 0;">📋 Important Information</h4>
      <ul style="color: #856404; margin: 0; padding-left: 20px;">
        <li>Please arrive 15 minutes before the start time</li>
        <li>Bring a notepad and pen for taking notes</li>
        <li>${trainingEvent.price > 0 ? 'Ensure your invoice has been paid to secure your spot' : 'No payment required for this free event'}</li>
        <li>We will send you a reminder closer to the event date</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; margin: 0 0 15px 0;">If you have any questions, please don't hesitate to contact us.</p>
      <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Training Team</p>
    </div>
  `;
};

const getInvoiceEmailContent = (invoice) => {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #721c24; margin: 0 0 10px 0; font-size: 24px;">📄 Training Registration Invoice</h2>
        <p style="color: #721c24; margin: 0; font-size: 16px;">Please find attached the invoice for your training registration.</p>
      </div>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">💰 Invoice Details</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Invoice Number:</strong></p>
          <p style="margin: 5px 0; color: #333; font-family: monospace;">${invoice.invoiceNumber}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold; font-size: 18px;">£${invoice.total.toFixed(2)}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Issue Date:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(invoice.issuedDate || invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Due Date:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>

    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #0c5460; margin: 0 0 10px 0;">💳 Payment Instructions</h4>
      <p style="color: #0c5460; margin: 0 0 10px 0;">Please review the attached invoice and process the payment by the due date to confirm your registration.</p>
      <p style="color: #0c5460; margin: 0; font-weight: bold;">Your training registration is confirmed once payment is received.</p>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #856404; margin: 0 0 10px 0;">🏦 Bank Details</h4>
      <p style="color: #856404; margin: 5px 0;"><strong>Account Name:</strong> Black Foster Carers Alliance</p>
      <p style="color: #856404; margin: 5px 0;"><strong>Sort Code:</strong> 23-05-80</p>
      <p style="color: #856404; margin: 5px 0;"><strong>Account Number:</strong> 51854683</p>
      <p style="color: #856404; margin: 5px 0;"><strong>Reference:</strong> ${invoice.invoiceNumber}</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; margin: 0 0 15px 0;">If you have any questions about this invoice, please don't hesitate to contact us.</p>
      <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Training Team</p>
    </div>
  `;
};

const getFeedbackRequestContent = (booking) => {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 24px;">🎓 Training Completed!</h2>
        <p style="color: #155724; margin: 0; font-size: 16px;">Congratulations on completing your training session.</p>
      </div>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📝 Share Your Experience</h3>
      <p style="color: #666; margin: 0 0 15px 0;">We value your feedback! Please take a moment to share your experience and help us improve our training programs.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://your-domain.com'}/feedback/${booking._id}" 
           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          📊 Provide Feedback
        </a>
      </div>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #856404; margin: 0 0 10px 0;">💡 Your Feedback Helps Us</h4>
      <ul style="color: #856404; margin: 0; padding-left: 20px;">
        <li>Improve our training content and delivery</li>
        <li>Better understand participant needs</li>
        <li>Enhance future training sessions</li>
        <li>Maintain high-quality standards</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; margin: 0 0 15px 0;">Thank you for choosing Black Foster Carers Alliance for your training needs.</p>
      <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Training Team</p>
    </div>
  `;
};

const getCertificateEmailContent = (certificate, invoiceInfo = '') => {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 24px;">🎓 Certificate of Completion</h2>
        <p style="color: #155724; margin: 0; font-size: 16px;">Congratulations! You have successfully completed your training.</p>
      </div>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📜 Certificate Details</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Course Title:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold;">${certificate.courseTitle}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Certificate Number:</strong></p>
          <p style="margin: 5px 0; color: #333; font-family: monospace;">${certificate.certificateNumber}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Completion Date:</strong></p>
          <p style="margin: 5px 0; color: #333;">${certificate.completionDate.toLocaleDateString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Duration:</strong></p>
          <p style="margin: 5px 0; color: #333;">${certificate.duration}</p>
        </div>
      </div>
    </div>

    ${invoiceInfo ? `
      <div style="background: #e2e3e5; border: 1px solid #d6d8db; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #383d41; margin: 0 0 10px 0;">💰 Payment Information</h4>
        ${invoiceInfo}
      </div>
    ` : ''}

    <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #0c5460; margin: 0 0 10px 0;">📎 Certificate Attachment</h4>
      <p style="color: #0c5460; margin: 0;">Your certificate is attached to this email. You can also download it from your training dashboard.</p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; margin: 0 0 15px 0;">Thank you for participating in our training program!</p>
      <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Training Team</p>
    </div>
  `;
};

const getBookingInvitationContent = (trainingEvent, bookingUrl, message = '') => {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: #cce5ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #004085; margin: 0 0 10px 0; font-size: 24px;">📧 Training Event Invitation</h2>
        <p style="color: #004085; margin: 0; font-size: 16px;">You're invited to join our upcoming training session!</p>
      </div>
    </div>

    ${message ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #333; margin: 0 0 10px 0;">💬 Personal Message</h4>
        <p style="color: #666; margin: 0; white-space: pre-line;">${message}</p>
      </div>
    ` : ''}

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📅 Event Details</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Title:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold;">${trainingEvent.title}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Date:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(trainingEvent.startDate).toLocaleDateString()} - ${new Date(trainingEvent.endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Time:</strong></p>
          <p style="margin: 5px 0; color: #333;">${new Date(trainingEvent.startDate).toLocaleTimeString()} - ${new Date(trainingEvent.endDate).toLocaleTimeString()}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Location:</strong></p>
          <p style="margin: 5px 0; color: #333;">${trainingEvent.location || 'To be confirmed'}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Price:</strong></p>
          <p style="margin: 5px 0; color: #333; font-weight: bold;">${trainingEvent.price > 0 ? `£${trainingEvent.price} ${trainingEvent.currency}` : 'Free'}</p>
        </div>
        <div>
          <p style="margin: 5px 0; color: #666;"><strong>Max Participants:</strong></p>
          <p style="margin: 5px 0; color: #333;">${trainingEvent.maxParticipants}</p>
        </div>
      </div>
      ${trainingEvent.description ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
          <p style="margin: 5px 0; color: #666;"><strong>Description:</strong></p>
          <p style="margin: 5px 0; color: #333;">${trainingEvent.description}</p>
        </div>
      ` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${bookingUrl}" style="background: #2EAB2C; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        📝 Book Now
      </a>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="color: #856404; margin: 0 0 10px 0;">🔗 Alternative Booking Method</h4>
      <p style="color: #856404; margin: 0 0 10px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #856404; margin: 0; word-break: break-all;">
        <a href="${bookingUrl}" style="color: #007bff; text-decoration: none;">${bookingUrl}</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; margin: 0 0 15px 0;">We look forward to seeing you at the training!</p>
      <p style="color: #333; font-weight: bold; margin: 0;">Best regards,<br>Black Foster Carers Alliance Training Team</p>
    </div>
  `;
};

module.exports = {
  getEmailHeader,
  getEmailFooter,
  getEmailContainer,
  getBookingConfirmationContent,
  getInvoiceEmailContent,
  getFeedbackRequestContent,
  getCertificateEmailContent,
  getBookingInvitationContent
};
