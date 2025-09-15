## CRM User Manual

This manual explains how to use each module of the CRM and the typical end-to-end workflows (e.g., training registration → invoice email → completion → certificate → feedback). It also includes module interconnections and how to export this manual to PDF.

### Quick Start (Top tasks)
1. Create a training event: Training → Create Event → Publish
2. Register and confirm a participant: Training → Event → Add Participant → set status to Confirmed (sends invoice)
3. Mark completion to send certificate: Training → Booking → set Completed (sends certificate + feedback request)
4. Mark an invoice as paid: Invoices → open invoice → Mark Paid (updates booking payment)
5. Add a candidate: Candidates → Add New → track via Recruitment Pipeline
6. Convert enquiry: Enquiries → open enquiry → Convert to Candidate or Case

### Getting Started
- **Login**: Visit the app URL and sign in with your credentials. Use “Reset Password” if needed.
- **Layout**: After login, you land on `Dashboard`. Use the left `Sidebar` to navigate modules.

### Navigation Map
- Dashboard: KPIs and quick links
- Candidates: Manage candidate records and pipeline
- Cases: Track active cases and case activity
- Contacts: General contact directory
- Freelancers: Manage freelancers and public application form
- Mentors: Manage mentors
- Contracts: Contracts list and status
- Contract Templates: Template library for contracts
- Email Templates: Reusable email templates
- Enquiries: Intake and conversion to candidates/cases
- Training: Events, bookings, certificates, invoices
- Certificates: All generated certificates
- Invoices: All invoices across modules
- Calendar: Events and trainings overview
- Users: User accounts and roles

---
## Core Records

### Candidates
- **Create**: Candidates → “Add New” → enter details → Save
- **Search/Filter**: Use the search bar and filters
- **Edit/Delete**: Candidates → delete from list/ edit from View

### Cases
- **Create**: Cases data will be sent from the website and saved in the CRM
- **Update**: Add notes, documents, and link related people
- **Delete**: Delete any Case data


### Contacts
- **Use** for storing contacts directly of individuals from cases/equiries etc whenever a case of enquiriry is created
- **Create**: Can add contacts Manually too → “Add New”

### Freelancers
- **Create/Manage** freelancer profiles
- **Public Form**: Share public link so freelancers can submit (`/freelancer-form/:token`)
- **Files**: Uploaded via their profile where applicable

#### Freelancer Flow
- Share public form link
- Review submissions, create internal records
- Link to relevant cases or training as needed

### Mentors
- Maintain mentor list and details

#### Mentor Flow
- Add mentor details, skills, availability
- Link mentors to trainings or cases where applicable

---
## Templates & Communication

### Email Templates
- **Create**: Email Templates → “New Template”
- **Use**: Select a template when sending emails from modules that support email
- **Variables**: Templates may include placeholders; fill data before sending

### Contract Templates
- **Create**: Contract Templates → “New Template”
- **Use**: Apply template when generating contracts in the `Contracts` module

### Contracts
- **Create**: Contracts → “New Contract”, pick a template or draft from scratch
- **Download**: Can be download pdf of contract and sent for further work

#### Contracts Flow
- Create from template
- Populate client/participant details
- Download PDf and share for further work

---
## Enquiries
- **List**: Enquiries → view incoming queries from the website
- **Detail**: Click a row to open `EnquiryDetail`
- **Update**: Update any data from the enquiry detail page

#### Enquiries Flow
- Capture initial details from website
- Qualify or disqualify an enquiry

---
## Training Module

### Training Events
- **Create Event**: Training → “Create Event”
  - Fields: Title, Description, Trainer, Location/Virtual Link, Start/End Date, Max Participants, Price, Currency, Tags
  - Publishing: Set status to `published` to allow bookings
- **Edit/Delete**: Update fields or remove events. Events with active bookings cannot be deleted (use force delete with caution).

### Bookings
- **Admin Booking**: Training → select event → “Add Participant”
- **Public Booking**: Share `bookingLink` (route: `/training/:bookingLink`) for participants
- **Registration Confirmation**:
  - When you update a booking’s `status` from `registered` → `confirmed`, the system ensures an invoice exists and emails it to the participant if not already sent.
- **Completion**:
  - Mark `completion.completed = true` to trigger certificate generation and feedback email.

### Invoices (Training)
- **Auto-Create**: For paid trainings, an invoice is generated on registration and sent on confirmation.
- **Resend**: From Training or Invoices module, use “Resend Invoice Email”.
- **Mark Paid**: Use Invoices module (Mark Paid) or update booking `payment` directly (see below).

### Certificates
- **Auto-Generate**: When a booking is marked completed for the first time.
- **Email Certificate**: Automatically sent to participant on generation.
- **Download**: Certificates → select certificate → Download.

### Feedback
- **Auto-Request**: Feedback request email is sent after completion.
- **Public Feedback**: Participants access via `/feedback/:bookingId`.

### Payment Status Updates
- Methods:
  1) Invoices → select invoice → “Mark Paid” (propagates `payment.status = paid` to related bookings).
  2) Training → open a booking → “Update Status” → include `payment` updates.
     - Example payload (API):
       - `PUT /api/training/bookings/:id`
       - Body: `{ "payment": { "status": "paid", "paidAt": "YYYY-MM-DDTHH:mm:ssZ" } }`

---
## Invoices Module
- **List/Filter**: See all invoices
- **Create**: Manually create for non-training cases if required
- **Update**: Edit fields for draft invoices
- **Mark Paid**: Sets status to paid and updates related bookings when applicable
- **PDF**: Generate/Regenerate PDF if needed

---
## Calendar
- View scheduled trainings and other events in a calendar view

---
## Users
- **List Users**: View user accounts
- **Create/Edit**: Add or edit users and roles (where enabled)

---
---
## Public & Integrations

### Public Freelancer Form
- Share tokenized URL with candidates to submit applications directly.

### Public Training Booking Link
- Share `bookingLink` to allow external participants to book published events.
