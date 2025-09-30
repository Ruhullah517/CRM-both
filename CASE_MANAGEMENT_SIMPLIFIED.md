# Case Management - Simplified Implementation (Per Brief)

## ✅ Changes Made Based on Your Feedback

### 1. **Simplified Case Information Section**

**Removed (not in brief):**
- ❌ Support Type field
- ❌ Risk Level field  
- ❌ Total Time Logged
- ❌ Invoiceable Hours
- ❌ Review Due date
- ❌ Case Type field

**Kept (per brief):**
- ✅ **Presenting Issues** - Summary of the case
- ✅ **Case Notes/Summary** - Ongoing notes and case details
- ✅ **Outcome Achieved** - Final outcome when closed
- ✅ **Assigned Caseworkers** - Who's working on it
- ✅ **Status** - Current status (Open, In Progress, Closed)
- ✅ **Date Opened** - When case was opened
- ✅ **Date Closed** - When case was closed (if applicable)
- ✅ **Supporting Documents** - File attachments
- ✅ **Meetings** - All meeting records with dates/types/notes
- ✅ **Activity Timeline** - All interactions logged

### 2. **Simplified Case List Table**

**Columns:**
- Reference Number
- Client Name
- Status
- Caseworkers
- Date Opened
- View Button

### 3. **Status Progression Made Easy** 🚀

The case progresses through statuses with **Quick Action Buttons**:

#### **Workflow Steps:**

1. **New → Open**
   - When case is created from referral: Status = "New"
   - Click **"Mark as Open"** button to open the case
   - Opens date is automatically set

2. **Open → In Progress**
   - After caseworker(s) are assigned
   - Click **"Start Progress"** button
   - Status changes to "In Progress"
   - Begin logging interactions in Activity Timeline

3. **In Progress → Closed**
   - When case work is complete
   - Add outcome details in "Outcome Achieved" field (via Edit)
   - Click **"Close Case"** button
   - Confirms before closing
   - Automatically sets closed date
   - Status becomes "Closed"

#### **Button Visibility:**

- **"Mark as Open"** - Shows when status is "New"
- **"Start Progress"** - Shows when status is "New", "Open", or "Awaiting Assessment" AND caseworkers are assigned
- **"Close Case"** - Shows when status is "Open", "In Progress", or "Active"
- All buttons hidden once case is closed

---

## 📋 What the Brief Required

From your brief:
> **For each case:** summary + meeting dates/types + notes + attachments.
> **Assign caseworkers.**
> **Track history & outcomes.**
> **Status monitoring (open, in progress, closed).**
> **Reports on support types & closure rates.**

### Implementation Matches:

✅ **Summary** → Presenting Issues + Case Notes/Summary  
✅ **Meeting dates/types** → Meetings section with type, date, notes, attachments  
✅ **Notes** → Case Notes/Summary field + Activity Timeline  
✅ **Attachments** → Supporting Documents section  
✅ **Assign caseworkers** → Caseworker assignment with lead designation  
✅ **Track history** → Activity Timeline logs all interactions  
✅ **Outcomes** → Outcome Achieved field  
✅ **Status monitoring** → Open, In Progress, Closed with quick buttons  
✅ **Reports** → Existing reporting system tracks closure rates

---

## 🎯 Complete Workflow (Simplified)

### **Step 1: Referral Received**
- External referral form submits to system
- Case created automatically with status "New"
- Case reference number generated (e.g., CASE-A1B2C3D4)

### **Step 2: Case Opened**
- Admin/Manager reviews new referral
- Clicks **"Mark as Open"** button
- Status → "Open"
- Date opened is set

### **Step 3: Assign Caseworker**
- Click **"Edit Case"** button
- Scroll to "Assigned Caseworkers" section
- Select caseworker from dropdown
- Mark one as "Lead" if multiple
- Click **"Add"**
- Save the case

### **Step 4: Start Working**
- Click **"Start Progress"** button (appears after caseworker assigned)
- Status → "In Progress"
- Begin logging all interactions:
  - Phone calls
  - Emails
  - Client meetings
  - Internal discussions
  - Document uploads
  - Case updates
  - Follow-up actions

### **Step 5: Add Meetings**
- In Meetings section, fill in:
  - Meeting type (Telephone, Online, Home Visit, Face to Face, Other)
  - Meeting date/time
  - Notes about the meeting
  - Upload attachments if needed
  - Optionally create reminder for follow-up
- Click **"Add meeting"**

### **Step 6: Log Activities**
- In Activity Timeline section, for each interaction:
  - Select activity type
  - Add time spent (e.g., "00:30" for 30 minutes)
  - Write description of what happened
  - Click **"Log Activity"**
- All activities show in chronological order with timestamps

### **Step 7: Close Case**
- Click **"Edit Case"** button
- Add final notes to "Case Notes/Summary"
- Add "Outcome Achieved" (describe what was accomplished)
- Save changes
- Click **"Close Case"** button
- Confirm the closure
- Status → "Closed"
- Closed date is automatically set

---

## 🔄 Status Flow Diagram

```
┌─────────────┐
│   Referral  │
│  Form Sent  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Click "Mark as Open"
│     NEW     ├────────────────────────┐
└─────────────┘                        │
                                       ▼
                              ┌─────────────┐
                              │    OPEN     │
                              └──────┬──────┘
                                     │
                        Assign Caseworker + Click "Start Progress"
                                     │
                                     ▼
                              ┌─────────────┐
                              │ IN PROGRESS │
                              └──────┬──────┘
                                     │
                     Log interactions, meetings, activities
                                     │
                Add outcome + Click "Close Case"
                                     │
                                     ▼
                              ┌─────────────┐
                              │   CLOSED    │
                              └─────────────┘
```

---

## 📊 Case Detail View Structure

### **Top Section:**
1. **Workflow Progress Bar** - Visual 5-step indicator showing current position
2. **Case Header** - Reference number, client name, current status badge

### **Main Content:**
3. **Meetings Section** - All meetings with notes and attachments
4. **Activity Timeline** - Complete interaction history with logging form
5. **Client Details** - Carer information
6. **Referrer Details** - Who referred the case
7. **SSW Details** - Social Service Worker info
8. **Decision Maker** - Decision maker contact
9. **Finance Contact** - Finance contact details
10. **Case Summary & Information** - Simplified section with:
    - Presenting Issues
    - Assigned Caseworkers
    - Case Notes/Summary
    - Outcome Achieved
    - Supporting Documents
    - Date Opened / Date Closed

### **Action Buttons:**
- Quick status buttons (Mark as Open / Start Progress / Close Case)
- Edit Case button
- Delete Case button (Admin/Manager only)

---

## 📝 Key Fields Explained

| Field | Purpose | When to Fill |
|-------|---------|--------------|
| **Presenting Issues** | Initial reason for the case | At case creation/opening |
| **Case Notes/Summary** | Ongoing notes about the case | Throughout case lifecycle |
| **Outcome Achieved** | Final result when closing | Before closing case |
| **Meetings** | Record of all meetings | After each meeting |
| **Activity Timeline** | Log of all interactions | After each interaction |
| **Supporting Documents** | Related files/evidence | Anytime during case |

---

## 💡 Best Practices

1. **Always log interactions immediately** - Don't wait, log phone calls and emails as they happen
2. **Use descriptive activity descriptions** - Be specific about what was discussed/done
3. **Track time accurately** - Helps understand caseworker workload
4. **Add outcomes before closing** - Essential for reporting and accountability
5. **Assign lead caseworker** - Clear ownership prevents things falling through cracks
6. **Regular meeting notes** - Document every meeting with detailed notes

---

## 🔒 Who Can Do What

| Role | Permissions |
|------|-------------|
| **Admin/Manager** | • View all cases<br>• Create/edit/delete cases<br>• Assign caseworkers<br>• Change status<br>• Close cases |
| **Caseworker** | • View assigned cases only<br>• Log activities<br>• Add meetings<br>• Upload documents<br>• Change status on assigned cases<br>• Close assigned cases |
| **Staff** | • View all cases<br>• Create/edit cases<br>• Log activities<br>• Add meetings |

---

## 📈 Reporting

The system tracks:
- Total cases opened/closed by date range
- Closure rates (% of cases closed successfully)
- Case status distribution
- Time to resolution (how long cases take to close)
- Caseworker caseload (how many cases per worker)
- Outcome analysis
- Activity types and frequency

Access reports via: **Operations** → **Reports** in sidebar

---

## ❓ FAQ

**Q: How do I mark a case as complete?**  
A: First add the outcome via Edit, then click the "Close Case" button.

**Q: What if I need to reopen a closed case?**  
A: Click "Edit Case" and change the status back to "In Progress" or "Open".

**Q: Can multiple caseworkers work on one case?**  
A: Yes! Add multiple caseworkers and designate one as Lead.

**Q: Where do I see the complete history of a case?**  
A: The Activity Timeline shows all logged interactions. Meetings section shows all meetings.

**Q: How do I track time spent on a case?**  
A: When logging activities, enter time spent in hh:mm format (e.g., "01:30" for 1.5 hours).

---

## ✅ Summary

The Case Management module now focuses on exactly what's in the brief:
- **Clean, simple interface**
- **Clear status progression** with one-click buttons
- **Complete interaction tracking** via Activity Timeline
- **Meeting management** with notes and attachments
- **Outcome documentation** for accountability
- **Easy workflow** from referral to closure

No unnecessary fields cluttering the interface. Just what you need to manage advocacy cases effectively! 🎉
