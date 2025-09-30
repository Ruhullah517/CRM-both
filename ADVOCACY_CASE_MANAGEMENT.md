# Advocacy & Case Management Module

## Overview
The Advocacy & Case Management module provides a comprehensive system for tracking and managing advocacy cases from initial referral through to closure. This module follows a structured workflow ensuring all client interactions are properly logged and tracked.

## Workflow
The module follows this exact flow:

```
Referral Form Received → Case Created → CaseWorker Assigned → All Interactions Logged → Closed When Complete
```

### Step-by-Step Process

1. **Referral Received**
   - Cases can be created from external referral forms (via `/referrals` endpoint)
   - Manual case creation is also available
   - Status: `New`

2. **Case Created**
   - System generates unique case reference number (e.g., CASE-A1B2C3D4)
   - All client and referrer details are captured
   - Status can be updated to `Open` or `Awaiting Assessment`

3. **Caseworker Assigned**
   - One or more caseworkers can be assigned to each case
   - One caseworker can be designated as the "Lead"
   - Multiple caseworkers can collaborate on a single case

4. **Interactions Logged**
   - All case activities are tracked in the Activity Timeline
   - Status progresses to `In Progress` or `Active`
   - Activities include:
     - Phone calls
     - Emails
     - Client meetings
     - Internal discussions
     - Document uploads
     - Case updates
     - Follow-up actions

5. **Case Closed**
   - Final status: `Closed`, `Closed – Resolved`, or `Closed – Unresolved`
   - Outcome is documented
   - All history is preserved for reporting

## Features

### Case Information
- **Client Details**: Name, DOB, gender, ethnicity, contact info
- **Referrer Details**: Referrer name, organization, contact details
- **SSW Details**: Social Service Worker information
- **Decision Maker**: Decision maker contact details
- **Finance Contact**: Finance contact information
- **Case Details**: 
  - Case type
  - Support type (Emotional, Legal, Financial, Housing, Employment, etc.)
  - Presenting issues
  - Risk level (Low, Medium, High)
  - Status tracking
  - Key dates (Opened, Review Due, Closed)

### Meeting Management
- Log meetings with dates and types:
  - Telephone
  - Online
  - Home Visit
  - Face to Face
  - Other
- Add meeting notes
- Attach files to meetings
- Set reminders for follow-ups

### Activity Timeline
- Comprehensive interaction logging
- Track time spent on each activity
- View complete case history
- Filter and search activities
- Caseworker attribution for all activities

### Document Management
- Upload and attach supporting documents
- Track who uploaded and when
- Link documents to specific meetings or general case
- Secure document storage

### Reporting
The system provides reports on:
- Support types distribution
- Case closure rates
- Time to resolution
- Caseworker caseload
- Demographic breakdowns
- Outcome analysis

## Access Control

### Roles
- **Admin**: Full access to all cases and features
- **Manager**: Full access to all cases and features
- **Caseworker**: Access to assigned cases, can log activities and update case details
- **Staff**: Can view and manage cases

## Navigation
Access the module via:
- Sidebar: **Advocacy & Case Management** > **Case Management**
- Direct URL: `/cases`
- Also accessible via: `/referrals` (for legacy compatibility)

## Case Status Flow

| Status | Description |
|--------|-------------|
| New | Case just created from referral |
| Open | Case opened and awaiting assessment |
| In Progress | Active work being done on case |
| Awaiting Assessment | Waiting for initial or ongoing assessment |
| Active | Case actively being managed |
| Paused | Temporarily on hold (reason required) |
| Escalated | Requires senior attention |
| Closed | Case completed |
| Closed – Resolved | Case closed with positive outcome |
| Closed – Unresolved | Case closed without resolution |

## Support Types
- Emotional Support
- Legal Advocacy
- Financial Guidance
- Housing Assistance
- Employment Support
- Educational Support
- Healthcare Navigation
- Family Mediation
- Crisis Intervention
- Other

## Key Features Implemented

✅ **Referral Form Integration**
- Public referral endpoint accepts external submissions
- Automatic case creation from referral data
- Contact record creation for all parties

✅ **Case Summary View**
- Complete case overview
- Workflow progress indicator
- All relevant details at a glance

✅ **Meeting Tracking**
- Date, type, and notes for each meeting
- File attachments support
- Reminder creation for follow-ups

✅ **Activity Logging**
- Detailed interaction tracking
- Time logging for invoicing
- Complete audit trail

✅ **Status Monitoring**
- Visual workflow progress
- Status-based filtering
- Automatic date tracking

✅ **Caseworker Assignment**
- Multi-caseworker support
- Lead caseworker designation
- Workload visibility

✅ **Reporting**
- Support type distribution
- Closure rate analysis
- Time tracking reports
- Demographic insights

## Technical Implementation

### Backend
- **Model**: `server/models/Case.js`
- **Controller**: `server/controllers/caseController.js`
- **Routes**: `server/routes/cases.js`
- **Meetings**: `server/controllers/caseMeetingController.js`
- **Activities**: `server/controllers/activityController.js`
- **Referrals**: `server/controllers/caseReferralController.js`

### Frontend
- **Main Component**: `client/src/pages/Cases.jsx`
- **Services**: 
  - `client/src/services/cases.js`
  - `client/src/services/caseMeetings.js`
  - `client/src/services/activities.js`
- **Route**: `/cases` in `client/src/routes/AppRouter.jsx`

## Usage Guide

### Creating a Case
1. Navigate to **Case Management** in sidebar
2. Click **Add Case** button
3. Fill in all required details
4. Assign caseworkers
5. Set initial status
6. Save the case

### Managing a Case
1. Click **View** on any case from the list
2. Review the workflow progress indicator
3. Add meetings as they occur
4. Log all interactions in the Activity Timeline
5. Upload supporting documents
6. Update status as case progresses
7. Close case when complete with outcome documentation

### Logging Activities
1. In case detail view, scroll to **Activity Timeline**
2. Select activity type
3. Enter description
4. Add time spent (for tracking/invoicing)
5. Click **Log Activity**

### Running Reports
1. Navigate to **Reports** section
2. Select case-related report type:
   - Case Status Report
   - Case Type Distribution
   - Support Type Analysis
   - Closure Rates
   - Time to Resolution
3. Apply date filters as needed
4. Export to CSV if required

## Best Practices

1. **Always log interactions**: Every phone call, email, or meeting should be logged in the Activity Timeline
2. **Update status regularly**: Keep case status current to reflect actual progress
3. **Assign lead caseworker**: Always designate one lead for accountability
4. **Document outcomes**: When closing cases, thoroughly document the outcome achieved
5. **Track time accurately**: Log time spent for accurate invoicing and workload analysis
6. **Use support types**: Properly categorize cases by support type for better reporting
7. **Set reminders**: Use meeting reminders to ensure follow-ups don't fall through cracks

## Future Enhancements (Potential)
- Email integration for automatic activity logging
- SMS notifications for case updates
- Calendar integration for meeting scheduling
- Advanced analytics dashboard
- Client portal for self-service updates
- Automated workflow triggers based on status changes
