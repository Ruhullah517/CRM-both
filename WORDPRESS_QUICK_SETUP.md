# WordPress CRM Integration - Quick Setup Guide

## 🎯 Overview

Connect your WordPress website forms to the CRM for automatic lead capture.

**Two Forms to Integrate**:
1. **Contact Us Form** → Captures inquiries
2. **Subscribe Button** → Captures newsletter signups

---

## 📡 API Endpoints

### Contact Form
```
POST https://crm-backend-0v14.onrender.com/api/leads/contact-form
```

### Subscribe Form
```
POST https://crm-backend-0v14.onrender.com/api/leads/subscribe
```

---

## 🚀 Quick Integration (Contact Form 7)

Add this to your WordPress theme's `functions.php`:

```php
<?php
// Send Contact Form 7 submissions to CRM
add_action('wpcf7_mail_sent', 'send_to_crm');

function send_to_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    
    if ($submission) {
        $posted_data = $submission->get_posted_data();
        
        // Prepare data
        $crm_data = array(
            'name' => isset($posted_data['your-name']) ? $posted_data['your-name'] : '',
            'email' => isset($posted_data['your-email']) ? $posted_data['your-email'] : '',
            'phone' => isset($posted_data['your-phone']) ? $posted_data['your-phone'] : '',
            'message' => isset($posted_data['your-message']) ? $posted_data['your-message'] : '',
            'subject' => isset($posted_data['your-subject']) ? $posted_data['your-subject'] : '',
            'source' => 'wordpress'
        );
        
        // OPTIONAL: If you have an interest dropdown/checkbox
        // Add this field to your CF7 form: [select interest "Training" "Mentoring" "General"]
        if (isset($posted_data['interest'])) {
            $interest = strtolower($posted_data['interest']);
            $crm_data['tags'] = array($interest . '_interest');
            $crm_data['interests'] = array($interest);
        }
        
        // Send to CRM
        wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/contact-form', array(
            'method' => 'POST',
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($crm_data),
            'timeout' => 15
        ));
    }
}
?>
```

---

## 📧 Newsletter Subscribe Integration

```php
<?php
// Newsletter subscription handler
add_action('wp_ajax_nopriv_subscribe_newsletter', 'subscribe_to_newsletter');
add_action('wp_ajax_subscribe_newsletter', 'subscribe_to_newsletter');

function subscribe_to_newsletter() {
    $email = sanitize_email($_POST['email']);
    $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
    
    if (!is_email($email)) {
        wp_send_json_error(array('message' => 'Invalid email'));
        return;
    }
    
    $crm_data = array(
        'email' => $email,
        'name' => $name,
        'source' => 'wordpress'
    );
    
    $response = wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/subscribe', array(
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($crm_data),
        'timeout' => 15
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => 'Failed. Please try again.'));
    } else {
        wp_send_json_success(array('message' => 'Thank you for subscribing!'));
    }
}
?>
```

---

## 🏷️ Automatic Tagging

### Option 1: Tags from WordPress Form (Recommended)

If your WordPress form has an interest selection field:

**Contact Form 7 Example**:
```
<label> Your Name
    [text* your-name] </label>

<label> Your Email
    [email* your-email] </label>

<label> Phone
    [tel your-phone] </label>

<label> I'm interested in:
    [select interest "Training" "Mentoring" "Membership" "General Inquiry"] </label>

<label> Your Message
    [textarea your-message] </label>

[submit "Send"]
```

**Result**:
- User selects "Training" → CRM tags: `training_interest`
- User selects "Mentoring" → CRM tags: `mentoring_interest`
- Automated emails trigger based on tags

### Option 2: Manual Tagging in CRM

If your form has NO interest selection:

1. All leads captured with default tags: `website_lead`, `contact_form`
2. Admin manually tags from CRM dashboard:
   - Go to **Sales & Communication**
   - Filter by source: `website`
   - Select contacts → Bulk tag → Choose tag
   - Available tags: Training, Mentoring, Hot Lead, etc.

---

## 🎯 What Gets Captured

### Contact Form Submission:
```json
{
  "name": "John Doe",              // ✅ Required
  "email": "john@example.com",     // ✅ Required
  "phone": "+44 123456789",        // Optional
  "message": "Your message here",  // Optional
  "subject": "Inquiry subject",    // Optional
  "companyName": "Company ABC",    // Optional
  "tags": ["training_interest"],   // Optional (from form or leave empty)
  "interests": ["training"],       // Optional (from form or leave empty)
  "source": "wordpress"            // Optional (identifies source)
}
```

### Newsletter Subscribe:
```json
{
  "email": "subscriber@example.com",  // ✅ Required
  "name": "Jane Smith",               // Optional
  "source": "wordpress"               // Optional
}
```

---

## 🔄 Complete Flow

```
WordPress Form Submitted
    ↓
PHP Hook Triggered (wpcf7_mail_sent)
    ↓
Data Sent to CRM API
    ↓
Contact Created in CRM
    ↓
Auto-Tagged (website_lead + contact_form/newsletter_subscriber)
    ↓
Additional Tags Added (if interest selected in form)
    ↓
Lead Score Assigned (+20 for contact, +10 for subscribe)
    ↓
Email Automation Triggered (based on tags)
    ↓
Admin Views in Sales & Communication Dashboard
```

---

## ✅ Testing

### Test Contact Form:
```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test from WordPress",
    "tags": ["training_interest"]
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "contactId": "..."
}
```

### Test Subscribe:
```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Verify in CRM:
1. Login to CRM
2. Go to **Sales & Communication** (in sidebar under Communication section)
3. Filter by:
   - Source: `website`
   - Tag: `website_lead`
4. You should see your test contact

---

## 📊 In the CRM Dashboard

### View All Website Leads:
1. Navigate to **Sales & Communication**
2. Apply filters:
   - **Source**: website
   - **Tag**: website_lead
3. See all contacts with:
   - Lead scores
   - Tags
   - Communication history
   - Last contact date

### Bulk Actions:
1. Select multiple contacts (checkbox)
2. Choose action:
   - **Tag: Training** → Bulk tag with training_interest
   - **Tag: Mentoring** → Bulk tag with mentoring_interest
   - **Send Email** → Send bulk email campaign

### Manual Tagging:
1. Click on any contact
2. Edit contact
3. Add tags manually
4. Add interest areas
5. Save

---

## 🤖 Email Automation Setup

After leads start flowing in, set up automated emails:

### 1. Create Email Templates
- Navigate to **Email Templates**
- Create templates for:
  - Welcome email
  - Training information
  - Mentoring information
  - Newsletter welcome

### 2. Set Up Automations
- Navigate to **Email Automations**
- Create automation:
  - **Name**: "Welcome Website Leads"
  - **Trigger**: Contact Created
  - **Condition**: leadSource equals "website"
  - **Template**: Select your welcome template
  - **Delay**: Immediate
  - **Status**: Active

### 3. Tag-Based Automations
Create separate automations for different interests:

**Training Interest**:
- Trigger: Contact Created
- Condition: tags contains "training_interest"
- Template: Training Info Email
- Delay: 5 minutes

**Newsletter Welcome**:
- Trigger: Contact Created
- Condition: tags contains "newsletter_subscriber"
- Template: Newsletter Welcome
- Delay: Immediate

---

## 🔧 Field Mapping

### Contact Form 7 Field Names → CRM Fields

| CF7 Field Name | CRM Field | Required |
|----------------|-----------|----------|
| `your-name` | name | ✅ |
| `your-email` | email | ✅ |
| `your-phone` | phone | ❌ |
| `your-message` | message | ❌ |
| `your-subject` | subject | ❌ |
| `interest` (custom) | tags, interests | ❌ |
| `company` (custom) | companyName | ❌ |

**Note**: Adjust field names in the PHP code if your CF7 form uses different field names.

---

## 🎨 Available Tags for Auto-Tagging

If you add an interest dropdown to your WordPress form:

| WordPress Form Value | CRM Tag | Interest Area |
|---------------------|---------|---------------|
| "Training" | `training_interest` | `training` |
| "Mentoring" | `mentoring_interest` | `mentoring` |
| "Membership" | `membership_interest` | `membership` |
| Custom value | `[value]_interest` | `[value]` |

---

## 📞 Support

### Common Issues:

**Leads not appearing in CRM?**
- Check WordPress error log: `wp-content/debug.log`
- Enable WordPress debugging: `define('WP_DEBUG', true);`
- Test API directly with cURL
- Verify required fields (name, email) are sent

**Duplicate contacts?**
- System automatically handles duplicates by email
- If duplicates appear, check email format consistency

**Tags not applying?**
- Ensure tags sent as array: `array('training')`
- Check PHP hook is receiving interest field value
- Manually tag from CRM if needed

---

## 📝 Summary

✅ **Two main endpoints**: Contact form & Subscribe
✅ **Automatic capture**: Leads flow from WordPress to CRM
✅ **Optional tagging**: Add interest dropdown to form for auto-tagging
✅ **Manual tagging**: Tag leads from CRM dashboard if form has no interest field
✅ **Automated emails**: Set up in CRM based on tags
✅ **Full visibility**: View and manage all leads in Sales & Communication dashboard

---

## 🚀 Next Steps

1. ✅ Add PHP code to `functions.php`
2. ✅ Test with sample submission
3. ✅ Verify contact appears in CRM
4. ✅ (Optional) Add interest dropdown to form
5. ✅ Create email templates in CRM
6. ✅ Set up email automations
7. ✅ Train team on manual tagging if needed

---

**For detailed integration guides, see**: `WORDPRESS_INTEGRATION_GUIDE.md`

**Your WordPress site is now connected to your CRM! 🎉**

