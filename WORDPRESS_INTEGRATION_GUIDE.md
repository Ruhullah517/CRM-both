# WordPress Integration Guide - Lead Capture

## Overview

This guide explains how to integrate your WordPress website forms with the CRM to automatically capture leads.

## Two Main Integration Points

### 1. **Contact Us Form** → `/api/leads/contact-form`
### 2. **Newsletter Subscribe Button** → `/api/leads/subscribe`

---

## API Endpoints

**Base URL**: `https://crm-backend-0v14.onrender.com/api/leads`

### 1. Contact Form Endpoint

**URL**: `POST /api/leads/contact-form`

**Required Fields**:
- `name` (string) - Contact's name
- `email` (string) - Contact's email

**Optional Fields**:
- `phone` (string) - Contact's phone number
- `message` (string) - Message from contact
- `subject` (string) - Subject/topic of inquiry
- `companyName` (string) - Organization/company name
- `tags` (array) - Custom tags for categorization (e.g., ["training", "mentoring"])
- `interests` (array) - Interest areas (e.g., ["training", "mentoring"])
- `source` (string) - Source identifier (default: "website")

**Example Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 123 456 7890",
  "message": "I'm interested in foster care training",
  "subject": "Training Inquiry",
  "tags": ["training", "urgent"],
  "interests": ["training"]
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

---

### 2. Newsletter Subscribe Endpoint

**URL**: `POST /api/leads/subscribe`

**Required Fields**:
- `email` (string) - Subscriber's email

**Optional Fields**:
- `name` (string) - Subscriber's name
- `source` (string) - Source identifier (e.g., "footer", "popup")
- `tags` (array) - Custom tags (e.g., ["newsletter", "monthly"])
- `interests` (array) - Interest areas

**Example Request**:
```json
{
  "email": "subscriber@example.com",
  "name": "Jane Smith",
  "source": "footer_widget",
  "tags": ["newsletter"],
  "interests": ["training", "mentoring"]
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

---

## WordPress Integration Methods

### Method 1: Using Contact Form 7 (Recommended)

If you're using Contact Form 7, you can use the WPCF7 REST API hook:

**Add to your theme's `functions.php`**:

```php
<?php
// Hook into Contact Form 7 submission
add_action('wpcf7_mail_sent', 'send_to_crm');

function send_to_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    
    if ($submission) {
        $posted_data = $submission->get_posted_data();
        
        // Prepare data for CRM
        $crm_data = array(
            'name' => isset($posted_data['your-name']) ? $posted_data['your-name'] : '',
            'email' => isset($posted_data['your-email']) ? $posted_data['your-email'] : '',
            'phone' => isset($posted_data['your-phone']) ? $posted_data['your-phone'] : '',
            'message' => isset($posted_data['your-message']) ? $posted_data['your-message'] : '',
            'subject' => isset($posted_data['your-subject']) ? $posted_data['your-subject'] : '',
            'source' => 'wordpress_cf7'
        );
        
        // Optional: Add tags based on form field selections
        // If you have a dropdown/checkbox for interest areas
        if (isset($posted_data['interest'])) {
            $crm_data['tags'] = array($posted_data['interest']);
            $crm_data['interests'] = array($posted_data['interest']);
        }
        
        // Send to CRM
        $response = wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/contact-form', array(
            'method' => 'POST',
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($crm_data),
            'timeout' => 15
        ));
        
        // Optional: Log the response
        if (is_wp_error($response)) {
            error_log('CRM submission failed: ' . $response->get_error_message());
        }
    }
}
?>
```

### Method 2: Using WPForms

**Add to your theme's `functions.php`**:

```php
<?php
// Hook into WPForms submission
add_action('wpforms_process_complete', 'send_wpforms_to_crm', 10, 4);

function send_wpforms_to_crm($fields, $entry, $form_data, $entry_id) {
    // Prepare data for CRM
    $crm_data = array(
        'name' => isset($fields[1]['value']) ? $fields[1]['value'] : '', // Field ID 1 is usually name
        'email' => isset($fields[2]['value']) ? $fields[2]['value'] : '', // Field ID 2 is usually email
        'phone' => isset($fields[3]['value']) ? $fields[3]['value'] : '',
        'message' => isset($fields[4]['value']) ? $fields[4]['value'] : '',
        'source' => 'wordpress_wpforms'
    );
    
    // Optional: Add tags from dropdown/checkbox fields
    if (isset($fields[5]['value'])) {
        $crm_data['tags'] = array($fields[5]['value']);
        $crm_data['interests'] = array($fields[5]['value']);
    }
    
    // Send to CRM
    wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/contact-form', array(
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($crm_data),
        'timeout' => 15
    ));
}
?>
```

### Method 3: Using Gravity Forms

**Add to your theme's `functions.php`**:

```php
<?php
// Hook into Gravity Forms submission
add_action('gform_after_submission', 'send_gravity_forms_to_crm', 10, 2);

function send_gravity_forms_to_crm($entry, $form) {
    // Prepare data for CRM
    $crm_data = array(
        'name' => rgar($entry, '1'), // Field ID 1
        'email' => rgar($entry, '2'), // Field ID 2
        'phone' => rgar($entry, '3'),
        'message' => rgar($entry, '4'),
        'source' => 'wordpress_gravity_forms'
    );
    
    // Optional: Add tags from dropdown/checkbox
    if (rgar($entry, '5')) {
        $crm_data['tags'] = array(rgar($entry, '5'));
        $crm_data['interests'] = array(rgar($entry, '5'));
    }
    
    // Send to CRM
    wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/contact-form', array(
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($crm_data),
        'timeout' => 15
    ));
}
?>
```

### Method 4: Newsletter Subscribe Button

For newsletter subscription (footer widget, popup, etc.):

**Add to your theme's `functions.php`**:

```php
<?php
// Custom AJAX handler for newsletter subscription
add_action('wp_ajax_nopriv_subscribe_newsletter', 'subscribe_to_newsletter');
add_action('wp_ajax_subscribe_newsletter', 'subscribe_to_newsletter');

function subscribe_to_newsletter() {
    $email = sanitize_email($_POST['email']);
    $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
    
    if (!is_email($email)) {
        wp_send_json_error(array('message' => 'Invalid email address'));
        return;
    }
    
    // Prepare data for CRM
    $crm_data = array(
        'email' => $email,
        'name' => $name,
        'source' => 'wordpress_newsletter'
    );
    
    // Send to CRM
    $response = wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/subscribe', array(
        'method' => 'POST',
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode($crm_data),
        'timeout' => 15
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error(array('message' => 'Subscription failed. Please try again.'));
    } else {
        wp_send_json_success(array('message' => 'Thank you for subscribing!'));
    }
}
?>
```

**Add JavaScript to your theme** (in footer or custom JS file):

```javascript
jQuery(document).ready(function($) {
    $('#newsletter-form').on('submit', function(e) {
        e.preventDefault();
        
        var email = $('#newsletter-email').val();
        var name = $('#newsletter-name').val() || '';
        
        $.ajax({
            url: ajaxurl, // WordPress AJAX URL
            type: 'POST',
            data: {
                action: 'subscribe_newsletter',
                email: email,
                name: name
            },
            success: function(response) {
                if (response.success) {
                    alert(response.data.message);
                    $('#newsletter-form')[0].reset();
                } else {
                    alert(response.data.message);
                }
            }
        });
    });
});
```

---

## Adding Interest Tagging to WordPress Forms

### If WordPress Form Has Interest Selection

If your WordPress contact form includes a dropdown or checkboxes for interests (e.g., Training, Mentoring, Membership), you can pass this to the CRM:

**Example Contact Form 7 Setup**:

```
[select interest "Training" "Mentoring" "Membership" "General Inquiry"]
```

**Updated PHP Code**:

```php
// Add tags based on interest selection
if (isset($posted_data['interest'])) {
    $interest = strtolower($posted_data['interest']);
    $crm_data['tags'] = array($interest . '_interest');
    $crm_data['interests'] = array($interest);
}
```

**Result in CRM**:
- If user selects "Training" → Contact gets tagged: `training_interest`
- If user selects "Mentoring" → Contact gets tagged: `mentoring_interest`
- Email automations will trigger based on these tags

### If WordPress Form Has NO Interest Selection

If your form doesn't have interest fields:
- All leads will be captured with default tags: `website_lead`, `contact_form`
- Admin can **manually tag** leads from the CRM dashboard
- Navigate to **Sales & Communication** → Select contacts → Bulk tag

---

## What Happens in the CRM

### Contact Form Submission:
1. ✅ Contact created/updated in CRM
2. ✅ Auto-tagged: `website_lead`, `contact_form`
3. ✅ Additional tags added if provided by WordPress form
4. ✅ Lead score: +20 points
5. ✅ Email automation triggered (if configured)
6. ✅ Admin can view in **Sales & Communication** dashboard

### Newsletter Subscription:
1. ✅ Contact created/updated in CRM
2. ✅ Auto-tagged: `website_lead`, `newsletter_subscriber`
3. ✅ Lead score: +10 points
4. ✅ Email automation triggered (welcome email)
5. ✅ Email preferences set to receive newsletters

---

## Testing Your Integration

### Test Contact Form:

**Using cURL**:
```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+44 123456789",
    "message": "This is a test from WordPress",
    "tags": ["training"],
    "interests": ["training"]
  }'
```

**Using WordPress PHP**:
```php
$test_data = array(
    'name' => 'Test User',
    'email' => 'test@example.com',
    'message' => 'Test from WordPress',
    'tags' => array('training'),
    'interests' => array('training')
);

$response = wp_remote_post('https://crm-backend-0v14.onrender.com/api/leads/contact-form', array(
    'method' => 'POST',
    'headers' => array('Content-Type' => 'application/json'),
    'body' => json_encode($test_data)
));

print_r(wp_remote_retrieve_body($response));
```

### Test Newsletter Subscribe:

```bash
curl -X POST https://crm-backend-0v14.onrender.com/api/leads/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newsletter@example.com",
    "name": "Newsletter Test"
  }'
```

### Verify in CRM:
1. Login to CRM
2. Go to **Sales & Communication**
3. Filter by source: `website`
4. You should see the test contact

---

## Field Mapping Reference

### Contact Form Fields:

| WordPress Field | CRM Field | Required | Notes |
|----------------|-----------|----------|-------|
| `your-name` / `name` | name | ✅ Yes | Contact's full name |
| `your-email` / `email` | email | ✅ Yes | Contact's email |
| `your-phone` / `phone` | phone | ❌ No | Phone number |
| `your-message` / `message` | message | ❌ No | Inquiry message |
| `your-subject` / `subject` | subject | ❌ No | Subject/topic |
| `company` / `organization` | companyName | ❌ No | Company name |
| `interest` (custom) | tags, interests | ❌ No | Interest selection |

### Subscribe Form Fields:

| WordPress Field | CRM Field | Required |
|----------------|-----------|----------|
| `email` | email | ✅ Yes |
| `name` | name | ❌ No |

---

## Automatic Email Triggers

Once leads are captured, you can set up email automations in the CRM:

### Example Automation Setup:

**1. Welcome Email for All Leads**:
- Trigger: Contact Created
- Condition: leadSource = "website"
- Template: General Welcome Email
- Delay: Immediate

**2. Training Interest Follow-up**:
- Trigger: Contact Created
- Condition: tags contains "training_interest"
- Template: Training Information Email
- Delay: 5 minutes

**3. Newsletter Welcome**:
- Trigger: Contact Created
- Condition: tags contains "newsletter_subscriber"
- Template: Newsletter Welcome Email
- Delay: Immediate

**Setup Location**: CRM → Email Automations → Create New

---

## Manual Tagging in CRM

If WordPress forms don't have interest selection fields:

1. Login to CRM
2. Navigate to **Sales & Communication**
3. Filter contacts by source: `website`
4. Select contacts (checkbox)
5. Use bulk actions:
   - **Tag: Training** → Adds `training_interest` tag
   - **Tag: Mentoring** → Adds `mentoring_interest` tag
   - **Tag: Hot Lead** → Adds `hot_lead` tag
6. Send targeted emails to tagged contacts

---

## Security & Best Practices

✅ **Sanitize Input**: Always sanitize user input in WordPress before sending to CRM
✅ **Validate Email**: Use WordPress `is_email()` and `sanitize_email()` functions
✅ **Error Handling**: Log errors for debugging but don't expose to users
✅ **Timeout**: Set reasonable timeout (15 seconds recommended)
✅ **Async**: Consider sending to CRM asynchronously to avoid slowing down form submission
✅ **Privacy**: Ensure compliance with GDPR/data protection laws

---

## Troubleshooting

### Issue: Forms submitting but not appearing in CRM

**Check**:
1. ✅ API endpoint URL is correct
2. ✅ Request format is JSON
3. ✅ Required fields (name, email) are being sent
4. ✅ Check WordPress error logs: `wp-content/debug.log`
5. ✅ Test endpoint directly with cURL

### Issue: Duplicate contacts created

**Solution**: The system automatically handles duplicates by email. If duplicates appear:
- Check if email addresses are slightly different
- Ensure email field is being sent correctly

### Issue: Tags not appearing

**Check**:
1. ✅ Tags are sent as an array: `array('training', 'mentoring')`
2. ✅ Not as a string: `'training, mentoring'` ❌
3. ✅ Correct field name: `tags` not `tag`

### Issue: Email automations not triggering

**Check**:
1. ✅ Automation is active in CRM
2. ✅ Trigger conditions match (check tags)
3. ✅ Email template is selected
4. ✅ Check CRM → Email Automations → Logs

---

## Support & Next Steps

### After Integration:

1. ✅ Test both forms thoroughly
2. ✅ Monitor leads in **Sales & Communication** dashboard
3. ✅ Set up email templates
4. ✅ Configure email automations
5. ✅ Train team on manual tagging if needed

### Need Help?

- Check CRM logs for submission status
- Review automation logs in Email Automations section
- Verify contact creation in Sales & Communication
- Test with sample data using provided cURL commands

---

## Quick Reference

**Contact Form API**: `POST /api/leads/contact-form`
**Subscribe API**: `POST /api/leads/subscribe`

**Minimum Required Data**:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**With Automatic Tagging**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "tags": ["training_interest", "urgent"],
  "interests": ["training"]
}
```

---

**Your WordPress forms are now connected to your CRM! 🎉**

Leads will automatically flow from WordPress → CRM → Tagged → Automated Emails → Admin Dashboard.

