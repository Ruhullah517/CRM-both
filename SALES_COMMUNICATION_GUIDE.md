# Sales & Communication Module - Implementation Guide

## Overview

The Sales & Communication module provides a comprehensive solution for managing contacts, sending emails, and capturing website leads with automated follow-ups.

## Flow Diagram

```
Website Lead → Contact Form/Subscribe → CRM Entry → Auto-Tagged → Automated Email → Admin Management
```

## Features Implemented

### 1. ✅ Contact Management
- Manage partner/customer contacts
- Filter by tags, type, and source
- Lead scoring system
- Bulk tagging and actions

### 2. ✅ Email Sending
- Send bulk emails to selected contacts
- Send individual emails
- Send emails by tags
- Email templates support

### 3. ✅ Email Templates
- Create and manage email templates
- Support for placeholders (name, organization, etc.)
- Template categories

### 4. ✅ Automated Email Flows
- Trigger-based automation (contact_created, contact_updated)
- Conditional email sending based on tags
- Delayed email delivery options

### 5. ✅ Lead Capture API
- Public endpoints for website forms
- Auto-tagging based on interest
- Automatic lead scoring

### 6. ✅ Contact Tagging
- Tag by interest (training, mentoring, etc.)
- Custom tags support
- Bulk tagging operations

---

## API Endpoints for Website Integration

### Base URL
- **Production**: `https://crm-backend-0v14.onrender.com/api/leads`
- **Development**: `http://localhost:5000/api/leads`

### 1. Contact Form Submission

**Endpoint**: `POST /api/leads/contact-form`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 123 456 7890",
  "subject": "General Inquiry",
  "message": "I would like to know more about your services",
  "companyName": "ABC Corporation"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "contactId": "60d5ec49f1b2c8b1f8e4e1a1"
}
```

**Tags Applied**: `website_lead`, `contact_form`

---

### 2. Newsletter Subscription

**Endpoint**: `POST /api/leads/subscribe`

**Request Body**:
```json
{
  "email": "subscriber@example.com",
  "name": "Jane Smith",
  "source": "website_footer"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for subscribing! Check your email for confirmation.",
  "contactId": "60d5ec49f1b2c8b1f8e4e1a2"
}
```

**Tags Applied**: `website_lead`, `newsletter_subscriber`

---

### 3. Training Interest Form

**Endpoint**: `POST /api/leads/training-interest`

**Request Body**:
```json
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+44 987 654 3210",
  "trainingType": "Foster Care Training",
  "preferredDate": "Next Month",
  "message": "Interested in advanced training course"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for your interest! Our team will contact you shortly.",
  "contactId": "60d5ec49f1b2c8b1f8e4e1a3"
}
```

**Tags Applied**: `website_lead`, `training_interest`
**Interest Areas**: `training`

---

### 4. Mentoring Interest Form

**Endpoint**: `POST /api/leads/mentoring-interest`

**Request Body**:
```json
{
  "name": "Mike Wilson",
  "email": "mike@example.com",
  "phone": "+44 555 123 4567",
  "mentoringType": "Career Mentoring",
  "availability": "Weekday Evenings",
  "message": "Looking for a mentor in social work"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thank you for your interest! Our team will contact you shortly.",
  "contactId": "60d5ec49f1b2c8b1f8e4e1a4"
}
```

**Tags Applied**: `website_lead`, `mentoring_interest`
**Interest Areas**: `mentoring`

---

## Sample HTML Forms for Website Integration

### 1. Contact Form Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
    <style>
        .form-container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background-color: #2EAB2C;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #258a23;
        }
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Contact Us</h2>
        <div id="message"></div>
        <form id="contactForm">
            <div class="form-group">
                <label for="name">Name *</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" name="phone">
            </div>
            <div class="form-group">
                <label for="companyName">Company Name</label>
                <input type="text" id="companyName" name="companyName">
            </div>
            <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" name="subject">
            </div>
            <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5"></textarea>
            </div>
            <button type="submit">Send Message</button>
        </form>
    </div>

    <script>
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                companyName: document.getElementById('companyName').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '<p>Sending...</p>';

            try {
                const response = await fetch('https://crm-backend-0v14.onrender.com/api/leads/contact-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    messageDiv.innerHTML = `<div class="success-message">${result.message}</div>`;
                    document.getElementById('contactForm').reset();
                } else {
                    messageDiv.innerHTML = `<div class="error-message">${result.message}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error-message">Failed to send message. Please try again later.</div>';
                console.error('Error:', error);
            }
        });
    </script>
</body>
</html>
```

### 2. Newsletter Subscription Form Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe to Newsletter</title>
    <style>
        .subscribe-container {
            max-width: 500px;
            margin: 50px auto;
            padding: 30px;
            background: linear-gradient(135deg, #2EAB2C 0%, #1d7a1d 100%);
            border-radius: 12px;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .subscribe-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        input {
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
        }
        button {
            background-color: white;
            color: #2EAB2C;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        button:hover {
            background-color: #f0f0f0;
        }
        .message {
            margin-top: 15px;
            padding: 12px;
            border-radius: 6px;
            background-color: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body>
    <div class="subscribe-container">
        <h2>Subscribe to Our Newsletter</h2>
        <p>Stay updated with the latest news and updates</p>
        <form class="subscribe-form" id="subscribeForm">
            <input type="email" id="email" placeholder="Enter your email" required>
            <input type="text" id="name" placeholder="Your name (optional)">
            <button type="submit">Subscribe</button>
        </form>
        <div id="subscribeMessage"></div>
    </div>

    <script>
        document.getElementById('subscribeForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                name: document.getElementById('name').value || undefined,
                source: 'website_footer'
            };

            const messageDiv = document.getElementById('subscribeMessage');
            messageDiv.innerHTML = '<div class="message">Subscribing...</div>';

            try {
                const response = await fetch('https://crm-backend-0v14.onrender.com/api/leads/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    messageDiv.innerHTML = `<div class="message">${result.message}</div>`;
                    document.getElementById('subscribeForm').reset();
                } else {
                    messageDiv.innerHTML = `<div class="message">${result.message}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="message">Failed to subscribe. Please try again later.</div>';
                console.error('Error:', error);
            }
        });
    </script>
</body>
</html>
```

### 3. Training Interest Form Example

```html
<!-- Add to your website's training page -->
<form id="trainingForm">
    <input type="text" id="trainingName" placeholder="Your Name" required>
    <input type="email" id="trainingEmail" placeholder="Your Email" required>
    <input type="tel" id="trainingPhone" placeholder="Phone Number">
    <select id="trainingType">
        <option value="">Select Training Type</option>
        <option value="Foster Care Training">Foster Care Training</option>
        <option value="Advanced Skills">Advanced Skills</option>
        <option value="Safeguarding">Safeguarding</option>
    </select>
    <input type="text" id="preferredDate" placeholder="Preferred Date">
    <textarea id="trainingMessage" placeholder="Additional Information"></textarea>
    <button type="submit">Submit Interest</button>
</form>

<script>
document.getElementById('trainingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('trainingName').value,
        email: document.getElementById('trainingEmail').value,
        phone: document.getElementById('trainingPhone').value,
        trainingType: document.getElementById('trainingType').value,
        preferredDate: document.getElementById('preferredDate').value,
        message: document.getElementById('trainingMessage').value
    };

    try {
        const response = await fetch('https://crm-backend-0v14.onrender.com/api/leads/training-interest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        alert(result.message);
        
        if (result.success) {
            document.getElementById('trainingForm').reset();
        }
    } catch (error) {
        alert('Failed to submit. Please try again later.');
    }
});
</script>
```

---

## Setting Up Email Automations

### Step 1: Create Email Templates

1. Navigate to **Email Templates** in the CRM
2. Create templates for different scenarios:
   - **Welcome Email** - For newsletter subscribers
   - **Contact Form Follow-up** - For general inquiries
   - **Training Information** - For training interest
   - **Mentoring Welcome** - For mentoring interest

**Template Placeholders**:
- `{name}` - Contact's name
- `{email}` - Contact's email
- `{organization}` - Organization name

### Step 2: Configure Email Automations

1. Navigate to **Email Automations** in the CRM
2. Create a new automation:
   - **Name**: "Welcome New Website Leads"
   - **Trigger**: Contact Created
   - **Condition**: leadSource equals "website"
   - **Email Template**: Select your welcome template
   - **Delay**: Immediate (or set a delay)
   - **Status**: Active

### Step 3: Tag-Specific Automations

Create separate automations for different interests:

**Training Interest Automation**:
- **Trigger**: Contact Created
- **Condition**: tags contains "training_interest"
- **Template**: Training Information Email
- **Delay**: 5 minutes

**Mentoring Interest Automation**:
- **Trigger**: Contact Created
- **Condition**: tags contains "mentoring_interest"
- **Template**: Mentoring Welcome Email
- **Delay**: 5 minutes

**Newsletter Welcome**:
- **Trigger**: Contact Created
- **Condition**: tags contains "newsletter_subscriber"
- **Template**: Newsletter Welcome
- **Delay**: Immediate

---

## Lead Scoring System

Leads are automatically scored based on actions:

| Action | Score Increase |
|--------|---------------|
| Contact Form Submission | +20 points |
| Newsletter Subscription | +10 points |
| Training Interest | +25 points |
| Mentoring Interest | +25 points |
| Return Submission | +5-15 points |

**Score Interpretation**:
- 0-39: Cold Lead
- 40-69: Warm Lead
- 70-100: Hot Lead

---

## Admin Workflow

### 1. Monitor New Leads

Navigate to **Sales & Communication** → **Contacts** tab

Filter by:
- **Tag**: `website_lead` to see all website submissions
- **Source**: `website` to see leads from website
- **Type**: `prospect` for new prospects

### 2. Review and Act

- Review lead score and tags
- Check communication history
- Add notes about interactions
- Update contact type when appropriate (prospect → customer)

### 3. Bulk Actions

Select multiple contacts and:
- Tag with specific interests
- Send targeted email campaigns
- Update lead scores
- Change contact types

### 4. Email Campaigns

1. Go to **Send Email** tab
2. Select an email template
3. Choose recipients:
   - By selected contacts
   - By tags (e.g., "training_interest")
4. Optionally override subject
5. Send campaign

---

## Testing the Integration

### Test Contact Form
```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+44 123456789",
    "message": "This is a test submission"
  }'
```

### Test Newsletter Subscribe
```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "name": "Test Subscriber"
  }'
```

---

## Security Notes

✅ **Public Endpoints**: The lead capture APIs are intentionally public (no authentication required) to allow website submissions

✅ **Rate Limiting**: Consider implementing rate limiting on your web server

✅ **CORS**: Ensure CORS is properly configured to accept requests from your website domain

✅ **Data Validation**: All inputs are validated on the server side

✅ **Email Verification**: Consider implementing email verification for newsletter subscriptions

---

## Support

For any issues or questions:
1. Check the CRM logs in the admin panel
2. Review automation logs in Email Automations section
3. Check contact creation in the Contacts section
4. Review email sending status in Email Management

---

## Summary

The Sales & Communication module provides:

✅ Complete lead capture workflow
✅ Automatic contact creation and tagging
✅ Automated email follow-ups
✅ Lead scoring and management
✅ Bulk email capabilities
✅ Tag-based segmentation
✅ Full admin control and visibility

**Flow**: Website Lead → CRM Entry → Auto-Tagged → Automated Email → Admin Management ✨

