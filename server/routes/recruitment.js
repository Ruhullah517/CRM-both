const express = require('express');
const router = express.Router();
const InitialAssessment = require('../models/InitialAssessment');
const FullAssessment = require('../models/FullAssessment');
const Mentoring = require('../models/Mentoring');
const CaseNote = require('../models/CaseNote');
const Enquiry = require('../models/Enquiry');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Reminder = require('../models/Reminder');
const Mentor = require('../models/Mentor');
const Freelancer = require('../models/Freelancer');

// Protect all recruitment endpoints for internal users
router.use(authenticate, authorize('admin', 'manager', 'staff'));

// Update pipeline stage
router.post('/enquiries/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    const allowed = ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'];
    if (!allowed.includes(stage)) return res.status(400).json({ msg: 'Invalid stage' });
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { pipelineStage: stage, status: stage },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    res.json(enquiry);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to update stage' });
  }
});

// Assign mentor or assessor to an enquiry
router.post('/enquiries/:id/assign', async (req, res) => {
  try {
    const { mentorId, assessorId, mentorNotes, assessorNotes } = req.body;
    const update = {};
    if (mentorId) update.assignedMentor = mentorId;
    if (assessorId) update.assignedAssessor = assessorId;
    if (mentorNotes !== undefined) update.mentorNotes = mentorNotes;
    if (assessorNotes !== undefined) update.assessorNotes = assessorNotes;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignedMentor')
      .populate('assignedAssessor');
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    res.json(enquiry);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to assign mentor/assessor' });
  }
});

// Update lifecycle status (Active, Paused, Completed, Withdrawn) with optional reason and pausedUntil
router.post('/enquiries/:id/status', async (req, res) => {
  try {
    const { status, reason, pausedUntil } = req.body;
    const allowed = ['New', 'Active', 'Paused', 'Completed', 'Withdrawn'];
    if (!allowed.includes(status)) return res.status(400).json({ msg: 'Invalid status' });
    const update = { status, statusReason: reason || undefined };
    if (status === 'Paused' && pausedUntil) {
      update.pausedUntil = new Date(pausedUntil);
    } else {
      update.pausedUntil = null;
    }
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    res.json(enquiry);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to update enquiry status' });
  }
});

// Set a deadline for a specific stage with optional reminder
router.post('/enquiries/:id/stage-deadline', async (req, res) => {
  try {
    const { stage, dueAt, reminder } = req.body;
    const allowed = ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'];
    if (!allowed.includes(stage)) return res.status(400).json({ msg: 'Invalid stage' });
    if (!dueAt) return res.status(400).json({ msg: 'dueAt is required' });

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });

    const deadline = {
      stage,
      dueAt: new Date(dueAt),
      createdBy: req.user?._id,
      createdAt: new Date()
    };
    enquiry.stageDeadlines = enquiry.stageDeadlines || [];
    enquiry.stageDeadlines.push(deadline);
    await enquiry.save();

    // Optional reminder creation for the deadline
    if (reminder && reminder.assignedTo) {
      try {
        const r = new Reminder({
          title: reminder.title || `Deadline: ${stage}`,
          description: reminder.description || `Complete ${stage} by due date`,
          dueAt: new Date(dueAt),
          relatedEntityType: 'enquiry',
          relatedEntityId: enquiry._id,
          assignedTo: reminder.assignedTo,
          createdBy: req.user._id,
        });
        await r.save();
      } catch {}
    }

    res.status(201).json(deadline);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to set stage deadline' });
  }
});

// Mark a stage deadline as completed
router.post('/enquiries/:id/stage-deadline/complete', async (req, res) => {
  try {
    const { stage } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    const dl = (enquiry.stageDeadlines || []).find(d => d.stage === stage && !d.completedAt);
    if (!dl) return res.status(404).json({ msg: 'No open deadline for this stage' });
    dl.completedAt = new Date();
    await enquiry.save();
    res.json({ msg: 'Deadline marked completed' });
  } catch (e) {
    res.status(500).json({ msg: 'Failed to complete stage deadline' });
  }
});

// Add a stage entry (notes/files/dates/meeting type)
router.post('/enquiries/:id/stage-entry', async (req, res) => {
  try {
    const { stage, meetingType, meetingDate, notes, files, reminder } = req.body;
    const allowed = ['Enquiry', 'Application', 'Assessment', 'Mentoring', 'Approval'];
    if (!allowed.includes(stage)) return res.status(400).json({ msg: 'Invalid stage' });
    const entry = {
      stage,
      meetingType,
      meetingDate,
      notes,
      files: Array.isArray(files) ? files : [],
      createdBy: req.user?._id,
      createdAt: new Date()
    };
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    enquiry.stageEntries.push(entry);
    await enquiry.save();
    // Optional reminder creation
    if (reminder && reminder.dueAt) {
      try {
        const r = new Reminder({
          title: reminder.title || `Follow-up: ${stage}`,
          description: reminder.description || notes,
          dueAt: new Date(reminder.dueAt),
          entityType: 'enquiry',
          entityId: enquiry._id,
          assignedTo: reminder.assignedTo || req.user._id,
          createdBy: req.user._id,
        });
        await r.save();
      } catch {}
    }
    res.status(201).json(entry);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to add stage entry' });
  }
});

// Upload a file for stage entry; returns URL and metadata
router.post('/enquiries/:id/stage-entry/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const fileMeta = {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      uploadedAt: new Date()
    };
    res.status(201).json(fileMeta);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to upload file' });
  }
});

// Get stage entries timeline for an enquiry
router.get('/enquiries/:id/stage-entries', async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id, 'stageEntries pipelineStage status');
    if (!enquiry) return res.status(404).json({ msg: 'Enquiry not found' });
    res.json({ pipelineStage: enquiry.pipelineStage, status: enquiry.status, entries: enquiry.stageEntries });
  } catch (e) {
    res.status(500).json({ msg: 'Failed to fetch stage entries' });
  }
});

// Create Initial Assessment
router.post('/initial-assessments', async (req, res) => {
  try {
    const ia = new InitialAssessment(req.body);
    await ia.save();
    // Update enquiry status
    if (req.body.enquiryId) {
      const status = req.body.result === 'Pass' ? 'Initial Pass' : (req.body.result === 'Fail' ? 'Screen Failed' : 'Needs More Info');
      await Enquiry.findByIdAndUpdate(req.body.enquiryId, { status });
    }
    res.status(201).json(ia);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to create initial assessment' });
  }
});

// Create Full Assessment
router.post('/full-assessments', async (req, res) => {
  try {
    const fa = new FullAssessment(req.body);
    await fa.save();
    if (req.body.enquiryId) {
      await Enquiry.findByIdAndUpdate(req.body.enquiryId, { status: 'Assessment Completed' });
    }
    res.status(201).json(fa);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to create full assessment' });
  }
});

// Create Mentoring allocation
router.post('/mentoring', async (req, res) => {
  try {
    const m = new Mentoring(req.body);
    await m.save();
    if (req.body.enquiryId) {
      await Enquiry.findByIdAndUpdate(req.body.enquiryId, { status: 'Active Mentoring' });
    }
    res.status(201).json(m);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to create mentoring' });
  }
});

// Add session to mentoring
router.post('/mentoring/:id/sessions', async (req, res) => {
  try {
    const m = await Mentoring.findById(req.params.id);
    if (!m) return res.status(404).json({ msg: 'Mentoring not found' });
    m.sessions.push(req.body);
    await m.save();
    res.json(m);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to add session' });
  }
});

// Add case note
router.post('/case-notes', async (req, res) => {
  try {
    const note = new CaseNote(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to add case note' });
  }
});

module.exports = router;



