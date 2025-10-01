# Email Templates & Automation Workflow Guide

## 🎯 Overview

Your understanding is **100% correct**! Here's the complete workflow:

1. **Create Email Templates** (with placeholders)
2. **Set Up Automations** (for automatic follow-ups when leads arrive)
3. **Run Manual Campaigns** (when you want to send marketing emails)

---

## 📝 Step-by-Step Workflow

### PHASE 1: Create Email Templates

#### Template Types to Create:

1. **Welcome/Follow-up Email** (Auto-sent when lead captured)
2. **Training Information Email** (Auto-sent when lead interested in training)
3. **Mentoring Information Email** (Auto-sent when lead interested in mentoring)
4. **Marketing Campaign Email** (Manual send for promotions)
5. **Service Info Email** (Manual send for service updates)
6. **Newsletter Template** (Auto-sent to subscribers)

---

### 📧 Creating Templates in CRM

**Navigate to**: Email Templates (in sidebar under Communication)

#### Example 1: Welcome Follow-up Template

**Template Name**: Welcome Website Lead

**Subject**: 
```
Thank you for contacting {name}!
```

**Body**:
```html
Hi {name},

Thank you for reaching out to us! We received your inquiry and our team will get back to you within 24 hours.

In the meantime, feel free to explore our services:
- Foster Care Training
- Mentoring Programs
- Support Services

If you have any urgent questions, please call us at +44 123 456 7890.

Best regards,
The Team
```

**Available Placeholders**:
- `{name}` - Contact's name
- `{email}` - Contact's email
- `{organization}` - Organization/company name

---

#### Example 2: Training Information Template

**Template Name**: Training Information

**Subject**: 
```
Information about our Training Programs for {name}
```

**Body**:
```html
Hello {name},

Thank you for your interest in our Training Programs!

We offer comprehensive foster care training courses including:
- Foundation Training (2 weeks)
- Advanced Skills Development (1 week)
- Safeguarding Training (3 days)

Our next training sessions start on [DATE]. 

Would you like to schedule a call to discuss which program best fits your needs?

You can reply to this email or call us at +44 123 456 7890.

Best regards,
Training Team

{organization}
```

---

#### Example 3: Marketing Campaign Template

**Template Name**: Monthly Newsletter

**Subject**: 
```
Monthly Updates & Special Offers - {name}
```

**Body**:
```html
Hi {name},

This month's highlights:

🎓 New Training Courses Available
🌟 Success Stories from Our Community
💡 Tips & Resources for Foster Carers

[CONTENT GOES HERE]

Special Offer: 15% off on all training bookings this month!

Want to learn more? Contact us or visit our website.

Best regards,
Marketing Team
```

---

### PHASE 2: Set Up Email Automations

**Navigate to**: Email Automations (in sidebar under Communication)

#### Automation 1: Welcome All Website Leads

**Click**: Create New Automation

**Settings**:
```
Name: Welcome Website Leads
Description: Auto-send welcome email to all new website leads

Trigger:
  Type: Contact Created
  
Conditions:
  Field: leadSource
  Operator: equals
  Value: website

Email Template: Welcome Website Lead (select from dropdown)

Recipient Type: Contact (the person who submitted form)

Delay:
  Type: Immediate
  (or "minutes" with value 5 for 5-minute delay)

Status: Active ✅
```

**Save Automation**

**What happens**: 
- WordPress form submitted → Contact created → Welcome email sent immediately (or after 5 minutes)

---

#### Automation 2: Training Interest Follow-up

**Settings**:
```
Name: Training Interest Follow-up
Description: Send training info to leads interested in training

Trigger:
  Type: Contact Created

Conditions:
  Field: tags
  Operator: contains
  Value: training_interest

Email Template: Training Information (select from dropdown)

Recipient Type: Contact

Delay:
  Type: minutes
  Value: 10

Status: Active ✅
```

**What happens**:
- Lead submits form with "Training" interest → Tagged with training_interest → Training email sent after 10 minutes

---

#### Automation 3: Newsletter Welcome

**Settings**:
```
Name: Newsletter Welcome
Description: Welcome email for newsletter subscribers

Trigger:
  Type: Contact Created

Conditions:
  Field: tags
  Operator: contains
  Value: newsletter_subscriber

Email Template: Newsletter Welcome (select from dropdown)

Recipient Type: Contact

Delay:
  Type: Immediate

Status: Active ✅
```

---

### PHASE 3: Running Manual Email Campaigns

**Navigate to**: Sales & Communication → Send Email tab

#### Scenario A: Send to Specific Contacts

1. **Go to Contacts tab**
2. **Select contacts** (use checkboxes)
   - Example: Select 50 contacts interested in training
3. **Click** "Send Email" button
4. **Select template**: "Marketing Campaign" or "Service Info"
5. **Override subject** (optional): "Special Training Offer This Week"
6. **Click** "Send Email"
7. **Result**: Email sent to 50 selected contacts with their names auto-filled

#### Scenario B: Send to All Contacts with Specific Tag

1. **Go to Send Email tab**
2. **Select template**: "Monthly Newsletter"
3. **Choose**: "Send by Tags"
4. **Select tag**: "training_interest"
5. **Click** "Send to: training_interest"
6. **Result**: All contacts with "training_interest" tag receive the email

---

## 🔄 Complete Flow Examples

### Example 1: New Lead from WordPress Contact Form

```
Step 1: User submits contact form on WordPress
  ↓
Step 2: WordPress sends data to CRM API
  ↓
Step 3: CRM creates new contact
  - Name: John Doe
  - Email: john@example.com
  - Tags: website_lead, contact_form
  - Lead Score: 20
  ↓
Step 4: Automation "Welcome Website Leads" triggers
  - Checks: leadSource = website ✅
  - Template: Welcome Website Lead
  - Placeholders filled:
    {name} → John Doe
    {email} → john@example.com
  ↓
Step 5: Email sent immediately to john@example.com
  Subject: "Thank you for contacting John Doe!"
  Body: "Hi John Doe, Thank you for reaching out..."
  ↓
Step 6: Admin sees contact in Sales & Communication dashboard
```

---

### Example 2: Lead Interested in Training

```
Step 1: User submits contact form with "Training" selected
  ↓
Step 2: WordPress sends data with tags: ["training_interest"]
  ↓
Step 3: CRM creates contact with training_interest tag
  ↓
Step 4: TWO automations trigger:
  
  Automation 1: "Welcome Website Leads"
    - Sends: Welcome email (immediately)
  
  Automation 2: "Training Interest Follow-up"
    - Sends: Training info email (after 10 minutes)
  ↓
Step 5: Contact receives 2 emails:
  - First: Welcome email
  - 10 minutes later: Training information email
```

---

### Example 3: Manual Marketing Campaign

```
Step 1: Admin wants to send monthly newsletter
  ↓
Step 2: Admin goes to Sales & Communication → Send Email
  ↓
Step 3: Admin selects template: "Monthly Newsletter"
  ↓
Step 4: Admin chooses: "Send by Tags" → "newsletter_subscriber"
  ↓
Step 5: CRM finds all contacts with newsletter_subscriber tag (e.g., 500 contacts)
  ↓
Step 6: CRM sends email to all 500 contacts
  - For each contact, fills placeholders:
    Contact 1: {name} → John Doe
    Contact 2: {name} → Jane Smith
    Contact 3: {name} → Mike Wilson
    etc.
  ↓
Step 7: All 500 contacts receive personalized email
  - John receives: "Hi John, This month's highlights..."
  - Jane receives: "Hi Jane, This month's highlights..."
  - Mike receives: "Hi Mike, This month's highlights..."
```

---

## 📊 Workflow Summary

### Automatic Emails (Set It and Forget It)

| When | Automation | Template Used | Result |
|------|------------|---------------|---------|
| Lead submits contact form | Welcome Website Leads | Welcome Website Lead | Auto-sent immediately |
| Lead interested in training | Training Interest Follow-up | Training Information | Auto-sent after 10 min |
| Lead interested in mentoring | Mentoring Interest Follow-up | Mentoring Information | Auto-sent after 10 min |
| Newsletter subscription | Newsletter Welcome | Newsletter Welcome | Auto-sent immediately |

### Manual Campaigns (Admin Initiates)

| When | Action | Template Used | Result |
|------|--------|---------------|---------|
| Monthly newsletter | Send by tags | Monthly Newsletter | Sent to all newsletter subscribers |
| Training promotion | Select contacts | Marketing Campaign | Sent to selected contacts |
| Service update | Send by tags | Service Info | Sent to all active contacts |
| Special offer | Select hot leads | Marketing Campaign | Sent to high-value leads |

---

## 🎯 Best Practices

### Template Creation

✅ **Use clear subject lines** - Include `{name}` for personalization
✅ **Keep it concise** - People scan emails, not read them
✅ **Add clear call-to-action** - What should they do next?
✅ **Test placeholders** - Make sure `{name}` etc. work correctly
✅ **Mobile-friendly** - Many people read on phones

### Automation Setup

✅ **Start simple** - Begin with welcome email only
✅ **Add delays** - Don't send all emails at once (space them out)
✅ **Test before activating** - Send test email to yourself first
✅ **Monitor logs** - Check Email Automations → Logs to see what's sent
✅ **Don't over-automate** - 2-3 automated emails per lead is enough

### Campaign Sending

✅ **Segment your audience** - Use tags to target specific groups
✅ **Timing matters** - Send newsletters on Tuesday/Wednesday mornings
✅ **Track engagement** - Check open rates and clicks
✅ **Don't spam** - Max 1-2 marketing emails per month
✅ **Personalize** - Always use `{name}` placeholder

---

## 🛠️ Setup Checklist

### Week 1: Email Templates

- [ ] Create "Welcome Website Lead" template
- [ ] Create "Training Information" template
- [ ] Create "Mentoring Information" template
- [ ] Create "Newsletter Welcome" template
- [ ] Test each template (send to yourself)

### Week 2: Automations

- [ ] Set up "Welcome Website Leads" automation (Active)
- [ ] Set up "Training Interest Follow-up" automation (Active)
- [ ] Set up "Newsletter Welcome" automation (Active)
- [ ] Test automations with sample contact

### Week 3: WordPress Integration

- [ ] Add PHP code to WordPress functions.php
- [ ] Test contact form submission
- [ ] Verify contact appears in CRM
- [ ] Verify welcome email is sent automatically
- [ ] Test newsletter subscribe

### Week 4: First Campaign

- [ ] Create "Monthly Newsletter" template
- [ ] Identify target audience (tag)
- [ ] Send test email to yourself
- [ ] Send to small group (10-20 contacts)
- [ ] Review results
- [ ] Send to full list

---

## 💡 Example Automation Strategy

### For New Website Leads (No Interest Specified)

**Day 1** - Immediate:
- Email 1: Welcome email (general)

**Day 3** - 3 days later:
- Email 2: "How can we help?" follow-up

**Day 7** - 7 days later:
- Email 3: Services overview

### For Training Interest Leads

**Day 1** - Immediate:
- Email 1: Welcome email

**Day 1** - 10 minutes later:
- Email 2: Training program details

**Day 3** - 3 days later:
- Email 3: Training dates & pricing

**Day 7** - 7 days later:
- Email 4: Success stories from trainees

### For Newsletter Subscribers

**Day 1** - Immediate:
- Email 1: Welcome to newsletter

**Monthly**:
- Email: Monthly newsletter (manual campaign)

---

## 🎨 Template Examples for Your Use Case

### Template: Welcome Website Lead

```
Subject: Thank you for contacting Black Foster Carers Alliance, {name}!

Hi {name},

Thank you for reaching out to Black Foster Carers Alliance. We're excited to help you on your journey!

Our team has received your inquiry and will respond within 24 hours.

In the meantime:
📚 Explore our training programs
👥 Read success stories from our community
💬 Join our support network

Questions? Call us at [PHONE] or reply to this email.

Best regards,
The BFCA Team
```

### Template: Training Information

```
Subject: Foster Care Training Programs - {name}

Hello {name},

Thank you for your interest in our training programs!

🎓 What We Offer:
- Foundation Foster Care Training (Skills to Foster)
- Advanced Development Courses
- Safeguarding & Child Protection
- Ongoing CPD Training

📅 Next Intake: [DATE]
⏱️ Duration: [DURATION]
📍 Format: Online & In-Person Options

Would you like to:
✅ Book a free consultation call?
✅ Download our training brochure?
✅ Register for the next intake?

Reply to this email or call [PHONE] to get started.

Best regards,
Training Team
Black Foster Carers Alliance
```

### Template: Monthly Newsletter

```
Subject: BFCA Monthly Update - {name}

Hi {name},

Welcome to this month's newsletter! Here's what's happening:

🌟 This Month's Highlights
[Content]

📚 New Training Courses
[Content]

💡 Foster Care Tips & Resources
[Content]

🎉 Success Stories
[Content]

📅 Upcoming Events
[Content]

Stay connected with us:
🌐 Website: [URL]
📱 Facebook: [URL]
📧 Email: [EMAIL]

Thanks for being part of our community!

The BFCA Team

---
Prefer not to receive these updates? [Unsubscribe]
```

---

## ✅ Your Understanding Is Perfect!

**What you said**:
1. ✅ Create email templates first (follow-up, marketing, service info)
2. ✅ When lead arrives → CRM automatically sends follow-up using template
3. ✅ For campaigns → Use template, CRM fills contact data automatically

**That's exactly how it works!**

---

## 🚀 Recommended Start

**This Week**:
1. Create 2-3 basic templates
2. Set up 1 automation (welcome email)
3. Test with WordPress form
4. Verify automation works

**Next Week**:
5. Create more templates
6. Add more automations
7. Plan first manual campaign

**Keep it simple at first, then expand!**

---

## 📞 Questions?

You've got the concept perfect! The workflow is:
- **Templates** (create once, use many times)
- **Automations** (automatic sending based on triggers)
- **Campaigns** (manual sending when you decide)

Ready to create your first template? 🎉

