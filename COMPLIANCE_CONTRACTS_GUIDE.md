# Compliance & Contracts Tabs - Complete Guide

## 📋 Overview

The **Compliance** and **Contracts** tabs in the HR Module provide automated monitoring and alerting for expiring documents and contracts. They help you stay compliant and never miss important renewal dates.

---

## 📋 **COMPLIANCE TAB**

### **🎯 Purpose:**
Monitor and track freelancer compliance documents (DBS checks, insurance, qualifications) that have expiry dates.

---

### **How It Works:**

#### **1. Data Source:**
The Compliance tab displays documents stored in each freelancer's profile under the `complianceDocuments` array.

```javascript
Freelancer Profile:
└── complianceDocuments: [
    {
      name: "DBS Check Certificate",
      type: "dbs",
      expiryDate: "2025-03-15",
      fileUrl: "/uploads/freelancers/dbs_john.pdf",
      uploadedAt: "2024-01-01"
    },
    {
      name: "Professional Insurance",
      type: "insurance",
      expiryDate: "2025-02-20",
      fileUrl: "/uploads/freelancers/insurance_john.pdf",
      uploadedAt: "2024-01-01"
    }
]
```

#### **2. What Gets Shown:**
The tab only shows documents that are expiring **within the next 30 days**.

```
Today's Date: January 10, 2025
30 Days From Now: February 9, 2025

Documents Shown:
✅ Expires Jan 15 (5 days) → SHOWN (within 30 days)
✅ Expires Feb 5 (26 days) → SHOWN (within 30 days)
❌ Expires March 15 (64 days) → NOT SHOWN (beyond 30 days)
```

---

### **📊 How to Use the Compliance Tab:**

#### **Step 1: Check the Tab**
```
Go to HR Module → Compliance Tab
        ↓
See header showing:
┌─────────────────────────────────────┐
│ Compliance Tracking           2     │
│ Monitor expiring documents... Expiring Soon
└─────────────────────────────────────┘
```

#### **Step 2: Review Expiring Documents**
```
┌──────────────────────────────────────────────┐
│ John Smith                [Expiring Soon]    │
│ DBS Check Certificate                        │
│ Expires: 15/01/2025                    [👁️]  │
├──────────────────────────────────────────────┤
│ Jane Doe                  [Expiring Soon]    │
│ Professional Insurance                       │
│ Expires: 20/01/2025                    [👁️]  │
└──────────────────────────────────────────────┘
```

Each item shows:
- **Freelancer name**
- **Document name**
- **Expiry date**
- **"Expiring Soon" badge** (red)
- **Eye icon** to view freelancer profile

#### **Step 3: Take Action**
```
Click eye icon [👁️]
        ↓
Opens freelancer's full profile
        ↓
Go to "Compliance" tab in their profile
        ↓
See all their documents
        ↓
Upload new document OR update expiry date
        ↓
Save changes
        ↓
Return to HR Module
        ↓
Document removed from Compliance tab (if renewed)
```

---

### **🚨 Automated Alerts:**

#### **Daily Checks (9:00 AM):**
```
Cron Job Runs Daily
        ↓
Scans ALL freelancers
        ↓
Finds documents with expiryDate ≤ 30 days
        ↓
Categorizes by urgency:
├── 🔴 Urgent (≤ 7 days)
├── 🟠 High (≤ 14 days)  
└── 🟡 Warning (≤ 30 days)
        ↓
Sends email to admin for urgent/high items
```

#### **Email Alert Example:**
```
To: admin@blackfostercarersalliance.co.uk
Subject: 🚨 URGENT - Compliance Documents Expiring Soon

┌─────────────────────────────────────────────────┐
│ The following documents require immediate       │
│ attention:                                      │
│                                                 │
│ Freelancer   │ Document    │ Type │ Days Left  │
│ ─────────────────────────────────────────────  │
│ John Smith   │ DBS Check   │ dbs  │ 5 days    │
│ Jane Doe     │ Insurance   │ ins  │ 7 days    │
│                                                 │
│ Action Required:                                │
│ • Contact freelancers to renew                 │
│ • Update documents in the system               │
│ • Ensure compliance requirements are met       │
└─────────────────────────────────────────────────┘
```

---

### **📝 How to Add Compliance Documents:**

#### **Method 1: Admin Adds for Freelancer**
```
1. Go to Freelancers tab (or open /freelancers)
2. Click "View" on a freelancer
3. Go to their "Compliance" tab
4. Click "Add Document" button
5. Fill in:
   ├── Document Name: "DBS Check Certificate"
   ├── Type: [DBS]
   ├── Expiry Date: [15/03/2027]
   └── Upload File: [Choose file]
6. Click "Save"
7. Document added to their profile
```

#### **Method 2: Freelancer Adds Themselves**
```
Freelancer logs in
        ↓
Goes to "My Profile" (self-service)
        ↓
Clicks "Compliance" tab
        ↓
Clicks "Add Document"
        ↓
Fills in details and uploads file
        ↓
Document added automatically
        ↓
Admin sees it in Compliance tab (if expiring soon)
```

---

## 📅 **CONTRACTS TAB**

### **🎯 Purpose:**
Monitor freelancer contract renewal dates and ensure contracts don't expire without notice.

---

### **How It Works:**

#### **1. Data Source:**
The Contracts tab displays freelancers who have a `contractRenewalDate` that is expiring **within the next 30 days**.

```javascript
Freelancer Profile:
└── contractRenewalDate: "2025-02-15"
└── contractStatus: "active"

If today is January 20, 2025:
└── Days until renewal: 26 days
└── Shows in Contracts tab: YES ✅
```

#### **2. What Gets Shown:**
Only freelancers with contracts expiring in the next 30 days.

```
Today's Date: January 10, 2025
30 Days From Now: February 9, 2025

Freelancers Shown:
✅ Contract expires Jan 25 (15 days) → SHOWN
✅ Contract expires Feb 5 (26 days) → SHOWN
❌ Contract expires March 15 (64 days) → NOT SHOWN
❌ No contract date set → NOT SHOWN
```

---

### **📊 How to Use the Contracts Tab:**

#### **Step 1: Check the Tab**
```
Go to HR Module → Contracts Tab
        ↓
See header showing:
┌─────────────────────────────────────┐
│ Contract Management           3     │
│ Monitor contract renewal...   Need Renewal
└─────────────────────────────────────┘
```

#### **Step 2: Review Expiring Contracts**
```
┌──────────────────────────────────────────────┐
│ John Smith                [Needs Renewal]    │
│ Assessor                                     │
│ Contract expires: 25/01/2025           [👁️]  │
├──────────────────────────────────────────────┤
│ Mike Johnson              [Needs Renewal]    │
│ Trainer                                      │
│ Contract expires: 28/01/2025           [👁️]  │
└──────────────────────────────────────────────┘
```

Each item shows:
- **Freelancer name**
- **Role**
- **Contract expiry date**
- **"Needs Renewal" badge** (red)
- **Eye icon** to view freelancer profile

#### **Step 3: Renew Contract**
```
Click eye icon [👁️]
        ↓
Opens freelancer's full profile (in new tab)
        ↓
Go to "HR" tab in their profile
        ↓
Find "Contract Renewal Date" field
        ↓
Update to new date (e.g., 1 year from now)
        ↓
Update "Contract Status" if needed:
  ├── active
  ├── pending_renewal
  └── expired
        ↓
Save changes
        ↓
Return to HR Module
        ↓
Freelancer removed from Contracts tab (if > 30 days)
```

---

### **🚨 Automated Alerts:**

#### **Daily Checks (9:00 AM):**
```
Cron Job Runs Daily
        ↓
Scans ALL freelancers
        ↓
Finds contracts with renewalDate ≤ 30 days
        ↓
Categorizes by urgency:
├── 🔴 Urgent (≤ 7 days)
├── 🟠 High (≤ 14 days)
└── 🟡 Warning (≤ 30 days)
        ↓
Sends email to admin for urgent/high items
```

#### **Email Alert Example:**
```
To: admin@blackfostercarersalliance.co.uk
Subject: 🚨 URGENT - Contracts Expiring Soon

┌─────────────────────────────────────────────────┐
│ The following contracts require immediate       │
│ attention:                                      │
│                                                 │
│ Freelancer   │ Status │ Expires    │ Days Left │
│ ─────────────────────────────────────────────  │
│ John Smith   │ active │ 25/01/2025 │ 5 days   │
│ Mike Johnson │ active │ 28/01/2025 │ 8 days   │
│                                                 │
│ Action Required:                                │
│ • Contact freelancers to renew contracts       │
│ • Update renewal dates in the system           │
│ • Ensure contract requirements are met         │
└─────────────────────────────────────────────────┘
```

---

### **📝 How to Set Contract Renewal Dates:**

#### **When Adding New Freelancer:**
```
1. Add freelancer (full form)
2. Scroll to "HR Module" section
3. Find "Contract Renewal Date" field
4. Set date (e.g., 1 year from today)
5. Set "Contract Status": active
6. Save freelancer
```

#### **For Existing Freelancer:**
```
1. Go to Freelancers tab
2. Click "View" or "Edit" on freelancer
3. Go to "HR" tab
4. Update "Contract Renewal Date"
5. Update "Contract Status" if needed
6. Save changes
```

---

## 🔄 **Complete Flow Examples:**

### **Example 1: Compliance Document Expiring**

```
DAY 1 - January 1, 2025
└── John's DBS expires on January 15 (14 days away)
└── Not urgent yet, but shows in Compliance tab

DAY 8 - January 8, 2025
└── John's DBS expires in 7 days
└── 🚨 URGENT email sent to admin
└── Still shows in Compliance tab

Admin receives email:
└── Opens HR Module
└── Goes to Compliance tab
└── Sees John's DBS expiring in 7 days
└── Clicks eye icon
└── Opens John's profile

In John's Profile:
└── Goes to "Compliance" tab
└── Contacts John (email/phone)
└── John sends new DBS certificate

Admin uploads new document:
└── Name: "DBS Check Certificate"
└── Type: DBS
└── Expiry Date: 15/01/2028 (3 years from now)
└── Upload File: dbs_john_new.pdf
└── Click "Save"

Result:
└── Old entry removed from Compliance tab
└── New document tracked in system
└── Alert cleared
└── Email stops being sent
```

---

### **Example 2: Contract Renewal**

```
DAY 1 - January 1, 2025
└── Mike's contract expires on January 25 (24 days away)
└── Shows in Contracts tab

DAY 12 - January 12, 2025
└── Mike's contract expires in 13 days
└── 🟠 HIGH PRIORITY email sent to admin
└── Still shows in Contracts tab

Admin receives email:
└── Opens HR Module
└── Goes to Contracts tab
└── Sees Mike's contract expiring in 13 days
└── Clicks eye icon
└── Opens Mike's profile

In Mike's Profile:
└── Goes to "HR" tab
└── Contacts Mike to discuss renewal
└── Negotiates new contract terms

Admin updates contract:
└── Contract Renewal Date: 25/01/2026 (1 year)
└── Contract Status: active
└── Save changes

Result:
└── Mike removed from Contracts tab
└── New renewal date tracked
└── Alert cleared
└── Next alert in 11 months
```

---

## 🔍 **Key Differences:**

### **Compliance Tab:**
```
Monitors: Individual DOCUMENTS
Source: complianceDocuments array
Shows: Documents expiring ≤ 30 days
Action: Upload new document
Multiple per freelancer: YES (many docs per person)
```

### **Contracts Tab:**
```
Monitors: Freelancer CONTRACTS
Source: contractRenewalDate field
Shows: Contracts expiring ≤ 30 days
Action: Update renewal date
One per freelancer: YES (one contract date per person)
```

---

## 📅 **Timeline Examples:**

### **Compliance Document Timeline:**
```
Day -90: Document uploaded (expires in 90 days)
         └── Not shown in Compliance tab ❌

Day -30: Document expires in 30 days
         └── Appears in Compliance tab ✅
         └── Email alert NOT sent yet

Day -14: Document expires in 14 days
         └── Still in Compliance tab ✅
         └── 🟠 HIGH PRIORITY email sent

Day -7:  Document expires in 7 days
         └── Still in Compliance tab ✅
         └── 🚨 URGENT email sent

Day 0:   Document expires TODAY
         └── Still in Compliance tab ✅
         └── 🚨 URGENT email sent (daily)

Day +1:  Document EXPIRED
         └── Still in Compliance tab ✅
         └── Shows as OVERDUE
```

### **Contract Renewal Timeline:**
```
Day -90: Contract renewal in 90 days
         └── Not shown in Contracts tab ❌

Day -30: Contract renewal in 30 days
         └── Appears in Contracts tab ✅
         └── Email alert NOT sent yet

Day -14: Contract renewal in 14 days
         └── Still in Contracts tab ✅
         └── 🟠 HIGH PRIORITY email sent

Day -7:  Contract renewal in 7 days
         └── Still in Contracts tab ✅
         └── 🚨 URGENT email sent

Day 0:   Contract expires TODAY
         └── Still in Contracts tab ✅
         └── Admin should update status to "expired"

Day +1:  Contract EXPIRED
         └── Admin updates status to "expired"
         └── Freelancer should not be assigned new work
```

---

## 🎯 **Practical Scenarios:**

### **Scenario 1: New Freelancer Onboarding**

```
Step 1: Add freelancer
Step 2: Upload compliance documents:
        ├── DBS Check (expires in 3 years)
        ├── Professional Insurance (expires in 1 year)
        └── Qualifications (no expiry)
Step 3: Set contract renewal date (1 year from now)
Step 4: Documents tracked automatically
Step 5: Receive alerts before expiry
Step 6: Renew and update
```

### **Scenario 2: Bulk Document Renewal**

```
Situation: Multiple freelancers have DBS checks expiring

Compliance Tab shows:
├── John Smith - DBS - 5 days
├── Jane Doe - DBS - 10 days
└── Mike Johnson - DBS - 15 days

Admin's workflow:
1. Email all freelancers at once
2. Request updated DBS certificates
3. As they send them:
   ├── Upload John's → Removed from list
   ├── Upload Jane's → Removed from list
   └── Upload Mike's → Removed from list
4. All cleared from Compliance tab
```

### **Scenario 3: Contract Renewals**

```
Situation: 3 contracts expiring this month

Contracts Tab shows:
├── John Smith - 15 days
├── Sarah Jones - 20 days
└── Tom Brown - 25 days

Admin's workflow:
1. Review each freelancer's performance
2. Decide on renewals
3. Contact each freelancer
4. For renewals:
   ├── Update renewal date to +1 year
   └── Keep status as "active"
5. For non-renewals:
   ├── Update status to "expired"
   └── Mark as unavailable
6. All updated freelancers removed from tab
```

---

## 🔔 **Alert Urgency Levels:**

### **Compliance Documents:**

| Days Left | Priority | Email Sent? | Tab Display |
|-----------|----------|-------------|-------------|
| 30 days | 🟡 Warning | No | Yes |
| 14 days | 🟠 High | Yes | Yes |
| 7 days | 🔴 Urgent | Yes (daily) | Yes |
| 0 days | 🔴 Expired | Yes (daily) | Yes |

### **Contracts:**

| Days Left | Priority | Email Sent? | Tab Display |
|-----------|----------|-------------|-------------|
| 30 days | 🟡 Warning | No | Yes |
| 14 days | 🟠 High | Yes | Yes |
| 7 days | 🔴 Urgent | Yes (daily) | Yes |
| 0 days | 🔴 Expired | Yes (daily) | Yes |

---

## 💡 **Best Practices:**

### **For Compliance:**
1. ✅ Upload documents when onboarding
2. ✅ Always set expiry dates (if applicable)
3. ✅ Check Compliance tab weekly
4. ✅ Respond to email alerts immediately
5. ✅ Keep documents updated 30+ days before expiry
6. ✅ Use freelancer self-service for uploads

### **For Contracts:**
1. ✅ Set renewal dates for all freelancers
2. ✅ Review contracts monthly
3. ✅ Start renewal process 30 days early
4. ✅ Update dates immediately after renewal
5. ✅ Mark expired contracts properly
6. ✅ Don't assign work to expired contracts

---

## 🎨 **Visual Indicators:**

### **In Compliance Tab:**
```
🟢 Green checkmark - All documents up to date
🔴 "Expiring Soon" badge - Needs attention
📄 Document icon - Click to view file
👁️ Eye icon - View freelancer profile
```

### **In Contracts Tab:**
```
🔴 "Needs Renewal" badge - Action required
📅 Date display - Shows expiry date
👁️ Eye icon - View freelancer profile
```

---

## 📊 **Backend Logic:**

### **Compliance Tab Query:**
```javascript
// Find all freelancers with expiring documents
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

const freelancers = await Freelancer.find({
  'complianceDocuments.expiryDate': { 
    $lte: thirtyDaysFromNow  // Less than or equal to 30 days
  }
});

// Filter individual documents
freelancers.forEach(freelancer => {
  freelancer.complianceDocuments.forEach(doc => {
    if (doc.expiryDate && doc.expiryDate <= thirtyDaysFromNow) {
      // Add to expiring list
    }
  });
});

// Sort by expiry date (most urgent first)
expiringItems.sort((a, b) => 
  new Date(a.expiryDate) - new Date(b.expiryDate)
);
```

### **Contracts Tab Query:**
```javascript
// Find all freelancers with expiring contracts
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

const freelancers = await Freelancer.find({
  contractRenewalDate: { 
    $lte: thirtyDaysFromNow,  // Less than or equal to 30 days
    $gte: new Date()          // Not in the past
  }
});

// Sort by renewal date (most urgent first)
freelancers.sort((a, b) => 
  new Date(a.contractRenewalDate) - new Date(b.contractRenewalDate)
);
```

---

## ❓ **Common Questions:**

### **Q: Why isn't my document showing in Compliance tab?**
**A:** The document only shows if it expires within 30 days. If it expires in 60 days, it won't appear yet.

### **Q: I updated a document but it's still showing?**
**A:** 
- Make sure you set the expiry date to more than 30 days in the future
- Refresh the page to see updated data
- Check that you saved the changes

### **Q: Can I see ALL compliance documents, not just expiring?**
**A:** Yes! Go to the Freelancers tab, click "View" on a freelancer, then go to their "Compliance" tab to see all their documents.

### **Q: What if a freelancer doesn't have a contract date?**
**A:** They won't appear in the Contracts tab. Set a contract renewal date in their profile to enable tracking.

### **Q: Can I change the 30-day threshold?**
**A:** Yes, you can modify the backend query in `freelancerController.js` to use a different timeframe (e.g., 60 days, 90 days).

### **Q: What if I miss a renewal?**
**A:** The item will still show in the tab (even if expired). Email alerts continue daily until you take action.

### **Q: Can freelancers renew their own contracts?**
**A:** No, only admins can update contract renewal dates. Freelancers can upload documents but not change contract dates.

---

## 🎉 **Summary:**

### **Compliance Tab:**
- **Purpose:** Track expiring compliance documents
- **Shows:** Documents expiring ≤ 30 days
- **Action:** Upload new documents
- **Automation:** Daily emails at 9 AM
- **Data:** From `complianceDocuments` array

### **Contracts Tab:**
- **Purpose:** Track expiring contracts
- **Shows:** Contracts expiring ≤ 30 days
- **Action:** Update renewal date
- **Automation:** Daily emails at 9 AM
- **Data:** From `contractRenewalDate` field

### **Both Tabs:**
- ✅ Automatic daily monitoring
- ✅ Email alerts for urgent items
- ✅ 30-day advance warning
- ✅ Easy navigation to freelancer profiles
- ✅ Clear visual indicators
- ✅ Sorted by urgency

**These tabs ensure you never miss important renewals and stay compliant with all requirements!** 🎯✨
