# 🧪 BFCA CRM - Complete Testing Guide

## 📋 **Prerequisites**
1. **Start the Application:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend  
   cd client
   npm run dev
   ```

2. **Access the Application:**
   - Open browser: `http://localhost:5173`
   - Login with admin credentials

---

## 🎯 **Module 1: Training Management**

### **Step 1.1: Create a Training Event**
1. Navigate to **Training Events** in sidebar
2. Click **"Create Event"** button
3. Fill in the form:
   - **Title:** "Foster Care Assessment Training"
   - **Description:** "Comprehensive training for new foster carers"
   - **Trainer:** Select from dropdown
   - **Location:** "BFCA Training Center" or add virtual link
   - **Start Date:** Tomorrow's date
   - **End Date:** Day after tomorrow
   - **Max Participants:** 15
   - **Price:** £150
   - **Status:** "Published" (to allow bookings)
4. Click **"Create Event"**
5. ✅ **Verify:** Event appears in the list with "Published" status

### **Step 1.2: Test Public Booking**
1. Copy the **booking link** from the created event
2. Open new browser tab (incognito)
3. Paste the booking link
4. Fill in participant details:
   - **Name:** "John Smith"
   - **Email:** "john@example.com"
   - **Phone:** "07123456789"
   - **Organization:** "Test Organization"
5. Click **"Book Training"**
6. ✅ **Verify:** Booking confirmation message appears

### **Step 1.3: Admin Booking Management**
1. Return to admin panel
2. Go to **Training Events** → Select your event
3. Click **"Add Participant"**
4. Fill in details and click **"Add"**
5. ✅ **Verify:** Participant appears in bookings list

### **Step 1.4: Confirm Booking & Generate Invoice**
1. In the bookings list, find your participant
2. Change status from **"Registered"** to **"Confirmed"**
3. ✅ **Verify:** 
   - Invoice is automatically generated
   - Email is sent to participant
   - Check **Invoices** module for new invoice

### **Step 1.5: Mark Training Complete & Generate Certificate**
1. In the booking details, mark **"Completed"** = true
2. ✅ **Verify:**
   - Certificate is automatically generated
   - Check **Certificates** module for new certificate
   - Feedback request email is sent

### **Step 1.6: Mark Invoice as Paid**
1. Go to **Invoices** module
2. Find the training invoice
3. Click **"Mark Paid"**
4. ✅ **Verify:** 
   - Invoice status changes to "Paid"
   - Payment date is recorded

---

## 🎯 **Module 2: Recruitment & Assessment**

### **Step 2.1: Create an Enquiry**
1. Navigate to **Enquiries** in sidebar
2. Click **"Add New Enquiry"**
3. Fill in personal details:
   - **Full Name:** "Sarah Johnson"
   - **Email:** "sarah@example.com"
   - **Phone:** "07987654321"
   - **Location:** "Manchester"
   - **Post Code:** "M1 1AA"
   - **Over 21:** Yes
   - **Has Spare Room:** Yes
   - **Previous Experience:** Yes
4. Click **"Save Enquiry"**
5. ✅ **Verify:** Enquiry appears in list with "Enquiry" stage

### **Step 2.2: Assign Staff Member**
1. In the enquiries list, click **"Assign"** for your enquiry
2. Select a staff member from the dropdown list
3. Click **"Confirm"**
4. ✅ **Verify:** Enquiry shows as assigned to staff member

### **Step 2.3: Initial Assessment**
1. Click **"Manage"** on the enquiry to open details
2. You'll see the **Recruitment Progress** showing current stage
3. Go to **"1. Initial Assessment"** section
4. Fill in assessment details:
   - **Assessment Notes:** "Initial screening completed"
   - **Date:** Today's date
   - **Status:** "Approved"
5. Click **"Submit Assessment"**
6. ✅ **Verify:** Progress shows "Initial Assessment" completed

### **Step 2.4: Application Documents**
1. Go to **"2. Application Documents"** section
2. Upload an application form (PDF)
3. Click **"Upload"**
4. ✅ **Verify:** Application document is uploaded and visible

### **Step 2.5: Form F Assessment**
1. Go to **"3. Form F Assessment"** section
2. Fill in assessment details:
   - **Recommendation:** "Proceed"
   - **Checks Done:** "DBS, References, Home Safety"
   - **Notes:** "All checks completed successfully"
3. Click **"Save Full Assessment"**
4. ✅ **Verify:** Progress shows "Form F Assessment" completed

### **Step 2.6: Mentoring Allocation**
1. Go to **"4. Mentoring Allocation"** section
2. Fill in mentoring details:
   - **Select Mentor:** Choose a mentor from the dropdown list
   - **Meeting Schedule:** "Weekly meetings"
3. Click **"Allocate Mentor"**
4. ✅ **Verify:** Progress shows "Mentoring" stage active

### **Step 2.7: Final Approval**
1. Go to **"5. Final Approval"** section
2. Review all completed stages
3. Click **"Approve Candidate"** or **"Reject Candidate"**
4. ✅ **Verify:** Final approval decision is recorded

### **Step 2.8: Track Pipeline Stages**
1. Go back to **Enquiries** list
2. ✅ **Verify:** Your enquiry shows the correct current stage
3. The stage should progress: Enquiry → Initial Assessment → Application → Form F Assessment → Mentoring → Approval

---

## 🎯 **Module 3: Advocacy & Case Management**

### **Step 3.1: Create a Case**
1. Navigate to **Referrals** (Cases) in sidebar
2. Click **"Add New Case"**
3. Fill in case details:
   - **Case Reference:** "CASE-2024-001"
   - **Client Full Name:** "Michael Brown"
   - **Date of Birth:** "1985-06-15"
   - **Gender:** "Male"
   - **Contact Info:** Email and phone
   - **Address:** "123 Test Street, London"
   - **Referral Source:** "Local Authority"
   - **Case Type:** "Support"
   - **Presenting Issues:** "Housing and employment support needed"
   - **Risk Level:** "Medium"
4. Click **"Create Case"**
5. ✅ **Verify:** Case appears in list with "New" status

### **Step 3.2: Assign Caseworker**
1. Click on the case to open details
2. Go to **"Caseworkers"** section
3. Click **"Assign Caseworker"**
4. Select a user from dropdown
5. Set as lead caseworker if needed
6. Click **"Assign"**
7. ✅ **Verify:** Caseworker appears in assigned list

### **Step 3.3: Add Case Notes**
1. In case details, go to **"Notes"** section
2. Click **"Add Note"**
3. Add note content: "Initial assessment completed, client is cooperative"
4. Click **"Save Note"**
5. ✅ **Verify:** Note appears in notes list with timestamp

### **Step 3.4: Schedule Meeting**
1. Go to **"Meetings"** section
2. Click **"Schedule Meeting"**
3. Fill in meeting details:
   - **Meeting Type:** "Home Visit"
   - **Date:** Tomorrow's date
   - **Time:** "10:00 AM"
   - **Notes:** "Discuss support plan"
4. Click **"Schedule Meeting"**
5. ✅ **Verify:** Meeting appears in meetings list

### **Step 3.5: Update Case Status**
1. Change case status to **"Active"**
2. Add outcome notes
3. ✅ **Verify:** Status updates and history is maintained

---

## 🎯 **Module 4: Sales & Communication**

### **Step 4.1: Create Contact**
1. Navigate to **Contact Management** in sidebar
2. Click **"Add New Contact"**
3. Fill in contact details:
   - **Name:** "Emma Wilson"
   - **Email:** "emma@example.com"
   - **Phone:** "07555123456"
   - **Contact Type:** "Customer"
   - **Interest Areas:** ["Training", "Mentoring"]
   - **Lead Source:** "Website"
   - **Organization:** "Test Org Ltd"
4. Click **"Save Contact"**
5. ✅ **Verify:** Contact appears in list

### **Step 4.2: Create Email Template**
1. Go to **Email Templates** in sidebar
2. Click **"New Template"**
3. Fill in template details:
   - **Name:** "Welcome Email"
   - **Subject:** "Welcome to BFCA Training"
   - **Content:** "Dear {{name}}, welcome to our training program..."
4. Click **"Save Template"**
5. ✅ **Verify:** Template appears in templates list

### **Step 4.3: Send Email**
1. Go to **Email Management** in sidebar
2. Click **"Compose Email"**
3. Select the template you created
4. Choose recipient (the contact you created)
5. Fill in any placeholders
6. Click **"Send Email"**
7. ✅ **Verify:** Email is sent and appears in sent list

### **Step 4.4: Create Email Automation**
1. Go to **Email Automations** in sidebar
2. Click **"New Automation"**
3. Set up automation:
   - **Name:** "Follow-up after enquiry"
   - **Trigger:** "New enquiry received"
   - **Template:** Select your template
   - **Delay:** "1 day"
4. Click **"Save Automation"**
5. ✅ **Verify:** Automation appears in list

---

## 🎯 **Module 5: Contract Generation**

### **Step 5.1: Create Contract Template**
1. Navigate to **Contract Templates** in sidebar
2. Click **"New Template"**
3. Fill in template details:
   - **Name:** "Freelancer Agreement"
   - **Type:** "Freelancer"
   - **Content:** "This agreement is between {{company_name}} and {{freelancer_name}}..."
4. Click **"Save Template"**
5. ✅ **Verify:** Template appears in templates list

### **Step 5.2: Generate Contract**
1. Go to **Contracts** in sidebar
2. Click **"New Contract"**
3. Select the template you created
4. Fill in contract details:
   - **Role Type:** "Freelancer"
   - **Client Name:** "Test Client"
   - **Start Date:** Today's date
   - **Rate:** "£50/hour"
5. Click **"Generate Contract"**
6. ✅ **Verify:** Contract is generated and appears in list

### **Step 5.3: Send for E-Signature**
1. Click on the generated contract
2. Click **"Send for Signature"**
3. Enter signer email
4. Click **"Send"**
5. ✅ **Verify:** Contract status changes to "Sent"

---

## 🎯 **Module 6: HR Module (Freelance Staff)**

### **Step 6.1: Create Freelancer Profile**
1. Navigate to **Freelancers** in sidebar
2. Click **"Add New Freelancer"**
3. Fill in personal information:
   - **Full Name:** "David Thompson"
   - **Email:** "david@example.com"
   - **Mobile:** "07444111222"
   - **Location:** "Birmingham"
   - **Role:** "Form F Assessor"
4. Fill in professional information:
   - **Has DBS Check:** Yes
   - **Social Work Registration:** Yes
   - **Experience Years:** "5"
5. Set rates and availability
6. Click **"Save Freelancer"**
7. ✅ **Verify:** Freelancer appears in list

### **Step 6.2: Test Public Freelancer Form**
1. Go to **Freelancers** → **"Public Form"**
2. Copy the public form link
3. Open new browser tab (incognito)
4. Paste the link and fill in the form
5. Submit the application
6. ✅ **Verify:** Application appears in freelancers list

### **Step 6.3: Upload Compliance Documents**
1. Click on the freelancer profile
2. Go to **"Documents"** section
3. Upload DBS certificate
4. Upload CV
5. ✅ **Verify:** Documents are uploaded and visible

### **Step 6.4: Assign to Case/Training**
1. In freelancer profile, go to **"Assignments"**
2. Assign to a case or training
3. Set hourly rate for assignment
4. ✅ **Verify:** Assignment is recorded

---

## 🎯 **Module 7: Dashboard & Reports**

### **Step 7.1: Test Dashboard**
1. Navigate to **Dashboard**
2. ✅ **Verify:** All widgets show correct data:
   - Total Cases count
   - Total Contracts count
   - Total Freelancers count
   - Total Enquiries count
   - Invoice overview with amounts
   - Recent cases list
   - Recent contracts list
   - Foster carer pipeline stages

### **Step 7.2: Test Reports**
1. Go to **Reports** in sidebar
2. Generate different report types:
   - Training reports
   - Case reports
   - Financial reports
3. ✅ **Verify:** Reports generate correctly with data

---

## 🎯 **Module 8: Role-Based Access Testing**

### **Step 8.1: Test Admin Access**
1. Login as admin user
2. ✅ **Verify:** All modules are visible in sidebar
3. Test creating, editing, deleting records
4. ✅ **Verify:** Full access to all features

### **Step 8.2: Test Staff Access**
1. Create a staff user account
2. Login as staff user
3. ✅ **Verify:** Most modules visible, but not User Management
4. Test limited permissions

### **Step 8.3: Test Freelancer Access**
1. Create a freelancer user account
2. Login as freelancer
3. ✅ **Verify:** Only "My Cases" and "My Profile" visible
4. Test viewing only assigned cases

### **Step 8.4: Test Mentor Access**
1. Create a mentor user account
2. Login as mentor
3. ✅ **Verify:** Only "My Cases" and "My Profile" visible
4. Test viewing only assigned cases

---

## 🎯 **Module 9: Public Forms Testing**

### **Step 9.1: Test Public Mentor Form**
1. Open new browser tab (incognito)
2. Go to: `http://localhost:5173/mentor-application`
3. Fill in the mentor application form
4. Submit the form
5. ✅ **Verify:** Application is received

### **Step 9.2: Test Public Freelancer Form**
1. Open new browser tab (incognito)
2. Go to: `http://localhost:5173/freelancer-application`
3. Fill in the freelancer application form
4. Submit the form
5. ✅ **Verify:** Application is received

---

## 🎯 **Module 10: Integration Testing**

### **Step 10.1: Test Calendar Integration**
1. Go to **Calendar** in sidebar
2. ✅ **Verify:** Training events appear on calendar
3. Test creating new events
4. ✅ **Verify:** Events sync across modules

### **Step 10.2: Test GDPR Compliance**
1. Go to **GDPR Management** (admin only)
2. Test data export functionality
3. Test data deletion requests
4. ✅ **Verify:** GDPR features work correctly

---

## ✅ **Final Verification Checklist**

### **Core Functionality:**
- [ ] Training events can be created and managed
- [ ] Public booking system works
- [ ] Invoices are auto-generated and can be marked paid
- [ ] Certificates are auto-generated
- [ ] Enquiries flow through recruitment pipeline
- [ ] Cases can be created and managed
- [ ] Contacts can be managed
- [ ] Email templates and sending works
- [ ] Contract generation works
- [ ] Freelancer management works
- [ ] Role-based access is enforced
- [ ] Dashboard shows correct data
- [ ] Public forms work

### **Data Flow Testing:**
- [ ] Training booking → Invoice generation → Payment tracking
- [ ] Enquiry → Initial Assessment → Full Assessment → Mentor Allocation
- [ ] Case creation → Caseworker assignment → Notes/Meetings
- [ ] Contact creation → Email sending → Communication history
- [ ] Contract template → Contract generation → E-signature
- [ ] Freelancer application → Profile creation → Assignment

### **User Experience:**
- [ ] Navigation is intuitive
- [ ] Forms are user-friendly
- [ ] Loading states work on all buttons
- [ ] Error handling is appropriate
- [ ] Mobile responsiveness works
- [ ] All modules are accessible

---

## 🚨 **Common Issues & Solutions**

### **If Training Booking Fails:**
- Check if event is published
- Verify booking link is correct
- Check server logs for errors

### **If Invoice Generation Fails:**
- Verify training event has a price
- Check invoice controller logs
- Ensure email service is configured

### **If Role Access Issues:**
- Verify user role in database
- Check PrivateRoute component
- Ensure role-based navigation is working

### **If Public Forms Don't Work:**
- Check if routes are properly configured
- Verify form submission endpoints
- Check CORS settings

---

## 📞 **Support Information**

- **Email:** Enquiries@blackfostercarersalliance.co.uk
- **Phone:** 0800 001 6230 (styled in green)
- **System:** BFCA CRM v1.0

---

**🎉 Congratulations! You've successfully tested all modules of the BFCA CRM system.**
