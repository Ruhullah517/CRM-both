const Mentor = require('../models/Mentor');
const MentorActivity = require('../models/MentorActivity');
const Enquiry = require('../models/Enquiry');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// List all mentors
const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    // Map created_at to dateAdded for frontend compatibility
    const mapped = mentors.map(m => ({
      ...m.toObject(),
      dateAdded: m.created_at,
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get a single mentor by ID
const getMentorById = async (req, res) => {
  try {
    const m = await Mentor.findById(req.params.id);
    if (!m) return res.status(404).json({ msg: 'Mentor not found' });
    res.json({
      ...m.toObject(),
      dateAdded: m.created_at,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create a new mentor (auto-creates a mentor user if an email is provided and not taken)
const createMentor = async (req, res) => {
  const { 
    name, email, phone, skills, status, avatar, mentees, 
    address, specialization, qualifications, notes, source, freelancerId 
  } = req.body;
  try {
    const mentor = new Mentor({
      name,
      email,
      phone,
      skills: skills || [],
      status: status || 'Active',
      avatar,
      mentees: mentees || [],
      address,
      specialization,
      qualifications,
      notes,
      source: source || 'direct',
      freelancerId,
      joinDate: new Date(),
      updated_at: new Date()
    });
    await mentor.save();

    let loginInfo = null;
    if (email) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        const tempPassword = `Mentor@${Math.random().toString(36).slice(-8)}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);
        const user = new User({
          name: name || email,
          email,
          password: hashedPassword,
          role: 'mentor',
          mentorId: mentor._id
        });
        await user.save();
        loginInfo = { email, tempPassword };
      }
    }

    res.status(201).json({ mentor, loginInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update a mentor
const updateMentor = async (req, res) => {
  const { 
    name, email, phone, skills, status, avatar, mentees,
    address, specialization, qualifications, notes 
  } = req.body;
  try {
    await Mentor.findByIdAndUpdate(req.params.id, {
      name,
      email,
      phone,
      skills: skills || [],
      status,
      avatar,
      mentees: mentees || [],
      address,
      specialization,
      qualifications,
      notes,
      updated_at: new Date()
    }, { new: true });
    res.json({ msg: 'Mentor updated' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete a mentor
const deleteMentor = async (req, res) => {
  try {
    await Mentor.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Mentor deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Assign mentees to mentor
const assignMenteesToMentor = async (req, res) => {
  const { mentees, mentorName } = req.body;
  const Candidate = require('../models/Candidate');
  
  try {
    // Update mentor's mentees
    await Mentor.findByIdAndUpdate(req.params.id, { mentees });
    
    // Update all candidates to reflect the mentor assignment
    // First, clear all candidates' mentor assignments for this mentor
    await Candidate.updateMany(
      { mentor: mentorName },
      { $unset: { mentor: "" } }
    );
    
    // Then assign the mentor to the selected candidates
    if (mentees && mentees.length > 0) {
      await Candidate.updateMany(
        { _id: { $in: mentees } },
        { mentor: mentorName }
      );
    }
    
    res.json({ msg: 'Mentees assigned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get mentor activities
const getMentorActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await MentorActivity.find({ mentorId: id })
      .populate('assignedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('enquiryId', 'full_name email_address')
      .sort({ date: -1, created_at: -1 });
    res.json(activities);
  } catch (error) {
    console.error('Error fetching mentor activities:', error);
    res.status(500).json({ error: error.message });
  }
};

// Log mentor activity
const logMentorActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, title, description, enquiryId, date, timeSpent, meetingSchedule } = req.body;
    
    if (!activityType || !description) {
      return res.status(400).json({ error: 'Activity type and description are required' });
    }

    const activityData = {
      mentorId: id,
      activityType,
      title,
      description,
      enquiryId,
      date: date ? new Date(date) : new Date(),
      timeSpent,
      meetingSchedule: meetingSchedule ? new Date(meetingSchedule) : undefined,
      createdBy: req.user?.id
    };

    // If enquiryId is provided, populate enquiry details
    if (enquiryId) {
      const enquiry = await Enquiry.findById(enquiryId);
      if (enquiry) {
        activityData.enquiryDetails = {
          enquiryName: enquiry.full_name,
          enquiryId: enquiry._id
        };
      }
    }

    const activity = new MentorActivity(activityData);
    await activity.save();

    const populatedActivity = await MentorActivity.findById(activity._id)
      .populate('assignedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('enquiryId', 'full_name email_address');

    res.status(201).json(populatedActivity);
  } catch (error) {
    console.error('Error logging mentor activity:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get mentor assignments (enquiries assigned to mentor + activity-based assignments)
const getMentorAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all enquiries where this mentor is allocated
    const enquiries = await Enquiry.find({ 'mentorAllocation.mentorId': id })
      .populate('mentorAllocation.allocatedBy', 'name email')
      .select('full_name email_address status mentorAllocation')
      .sort({ 'mentorAllocation.allocatedAt': -1 });

    // Get assignment activities for this mentor
    const assignmentActivities = await MentorActivity.find({ 
      mentorId: id, 
      activityType: 'assignment' 
    })
      .populate('assignedBy', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('enquiryId', 'full_name email_address status')
      .sort({ date: -1, created_at: -1 });

    // Combine enquiry-based assignments with activity-based assignments
    const enquiryAssignments = enquiries.map(enquiry => ({
      _id: `enquiry-${enquiry._id}`,
      type: 'enquiry',
      enquiryId: enquiry._id,
      enquiryName: enquiry.full_name,
      enquiryEmail: enquiry.email_address,
      enquiryStatus: enquiry.status,
      allocation: enquiry.mentorAllocation,
      assignedBy: enquiry.mentorAllocation?.allocatedBy,
      assignedAt: enquiry.mentorAllocation?.allocatedAt,
      meetingSchedule: enquiry.mentorAllocation?.meetingSchedule,
      status: enquiry.mentorAllocation?.status === 'completed' ? 'completed' : 'active'
    }));

    const activityAssignments = assignmentActivities.map(activity => ({
      _id: activity._id,
      type: 'activity',
      activityId: activity._id,
      enquiryId: activity.enquiryId?._id,
      enquiryName: activity.enquiryDetails?.enquiryName || activity.enquiryId?.full_name,
      enquiryEmail: activity.enquiryId?.email_address,
      enquiryStatus: activity.enquiryId?.status,
      title: activity.title,
      description: activity.description,
      assignedBy: activity.assignedBy || activity.createdBy,
      assignedAt: activity.date || activity.created_at,
      meetingSchedule: activity.meetingSchedule,
      status: activity.status || 'active',
      completedAt: activity.completedAt,
      completedBy: activity.completedBy
    }));

    // Combine and deduplicate (prefer activity-based if both exist for same enquiry)
    const allAssignments = [...activityAssignments];
    enquiryAssignments.forEach(ea => {
      if (!allAssignments.find(a => a.enquiryId && a.enquiryId.toString() === ea.enquiryId.toString())) {
        allAssignments.push(ea);
      }
    });

    res.json(allAssignments.sort((a, b) => new Date(b.assignedAt || b.date) - new Date(a.assignedAt || a.date)));
  } catch (error) {
    console.error('Error fetching mentor assignments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper: resolve assignment record (activity-based or enquiry-based)
async function resolveAssignment(id, assignmentId) {
  let assignmentActivity = null;
  let enquiryAssignment = null;

  if (assignmentId.startsWith('enquiry-')) {
    const enquiryId = assignmentId.replace('enquiry-', '');
    const enquiry = await Enquiry.findById(enquiryId)
      .populate('mentorAllocation.allocatedBy', 'name email')
      .populate('mentorAllocation.mentorId', 'name email status')
      .select('full_name email_address status mentorAllocation');

    if (enquiry) {
      enquiryAssignment = {
        _id: assignmentId,
        type: 'enquiry',
        enquiryId: enquiry._id,
        enquiryName: enquiry.full_name,
        enquiryEmail: enquiry.email_address,
        enquiryStatus: enquiry.status,
        allocation: enquiry.mentorAllocation,
        assignedBy: enquiry.mentorAllocation?.allocatedBy,
        assignedAt: enquiry.mentorAllocation?.allocatedAt,
        meetingSchedule: enquiry.mentorAllocation?.meetingSchedule,
        status: enquiry.mentorAllocation?.status === 'completed' ? 'completed' : 'active'
      };
      assignmentActivity = await MentorActivity.findOne({
        mentorId: id,
        activityType: 'assignment',
        enquiryId
      });
    }
  } else {
    assignmentActivity = await MentorActivity.findById(assignmentId)
      .populate('assignedBy', 'name email')
      .populate('completedBy', 'name email')
      .populate('enquiryId', 'full_name email_address status');
    if (assignmentActivity?.mentorId?.toString() === id && assignmentActivity.activityType === 'assignment') {
      enquiryAssignment = assignmentActivity.enquiryId ? {
        _id: `enquiry-${assignmentActivity.enquiryId?._id}`,
        type: 'enquiry',
        enquiryId: assignmentActivity.enquiryId?._id,
        enquiryName: assignmentActivity.enquiryDetails?.enquiryName || assignmentActivity.enquiryId?.full_name,
        enquiryEmail: assignmentActivity.enquiryId?.email_address,
        enquiryStatus: assignmentActivity.enquiryId?.status,
        status: assignmentActivity.status || 'active',
      } : null;
    } else {
      assignmentActivity = null;
    }
  }

  return { assignmentActivity, enquiryAssignment };
}

// Mark assignment as completed
const completeAssignment = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { completionNotes } = req.body;

    const { assignmentActivity, enquiryAssignment } = await resolveAssignment(id, assignmentId);

    if (!assignmentActivity && !enquiryAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // If enquiry-based assignment, mark mentorAllocation and linked activity (if exists)
    if (enquiryAssignment) {
      await Enquiry.findByIdAndUpdate(enquiryAssignment.enquiryId, {
        'mentorAllocation.status': 'completed',
        updatedAt: new Date()
      });
    }

    if (assignmentActivity) {
      assignmentActivity.status = 'completed';
      assignmentActivity.completedAt = new Date();
      assignmentActivity.completedBy = req.user?.id;
      if (completionNotes) {
        assignmentActivity.description = assignmentActivity.description + '\n\nCompletion Notes: ' + completionNotes;
      }
      await assignmentActivity.save();
    }

    res.json(assignmentActivity || enquiryAssignment);
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get assignment detail with logs
const getAssignmentDetail = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    let { assignmentActivity, enquiryAssignment } = await resolveAssignment(id, assignmentId);

    if (!assignmentActivity && !enquiryAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // If enquiry-based assignment has no activity record yet, create it so logs can attach
    if (!assignmentActivity && enquiryAssignment) {
      assignmentActivity = await createAssignmentActivity(
        id,
        enquiryAssignment.enquiryId,
        req.user?.id,
        enquiryAssignment.meetingSchedule
      );
    }

    const parentId = assignmentActivity?._id || null;
    const logs = parentId
      ? await MentorActivity.find({
          mentorId: id,
          parentAssignmentId: parentId,
          activityType: 'assignment_log'
        })
          .populate('createdBy', 'name email')
          .sort({ date: -1, created_at: -1 })
      : [];

    const base = assignmentActivity ? {
      _id: assignmentActivity._id,
      type: 'activity',
      enquiryId: assignmentActivity.enquiryId?._id,
      enquiryName: assignmentActivity.enquiryDetails?.enquiryName || assignmentActivity.enquiryId?.full_name,
      enquiryEmail: assignmentActivity.enquiryId?.email_address,
      enquiryStatus: assignmentActivity.enquiryId?.status,
      title: assignmentActivity.title,
      description: assignmentActivity.description,
      assignedBy: assignmentActivity.assignedBy || assignmentActivity.createdBy,
      assignedAt: assignmentActivity.date || assignmentActivity.created_at,
      meetingSchedule: assignmentActivity.meetingSchedule,
      status: assignmentActivity.status || 'active',
      completedAt: assignmentActivity.completedAt,
      completedBy: assignmentActivity.completedBy,
    } : enquiryAssignment;

    res.json({ assignment: base, logs });
  } catch (error) {
    console.error('Error fetching assignment detail:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add assignment log entry
const addAssignmentLog = async (req, res) => {
  try {
    const { id, assignmentId } = req.params;
    const { title, description, timeSpent, date, meetingSchedule } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    let { assignmentActivity, enquiryAssignment } = await resolveAssignment(id, assignmentId);
    if (!assignmentActivity && !enquiryAssignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Auto-create assignment activity for enquiry-based assignments that are missing it
    if (!assignmentActivity && enquiryAssignment) {
      assignmentActivity = await createAssignmentActivity(
        id,
        enquiryAssignment.enquiryId,
        req.user?.id,
        enquiryAssignment.meetingSchedule
      );
    }

    if (!assignmentActivity) {
      return res.status(400).json({ error: 'Assignment activity not found to attach logs' });
    }

    const parentId = assignmentActivity._id;

    const log = new MentorActivity({
      mentorId: id,
      activityType: 'assignment_log',
      parentAssignmentId: parentId,
      title,
      description,
      timeSpent,
      date: date ? new Date(date) : new Date(),
      meetingSchedule: meetingSchedule ? new Date(meetingSchedule) : undefined,
      createdBy: req.user?.id
    });

    await log.save();

    const populated = await MentorActivity.findById(log._id).populate('createdBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error adding assignment log:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create assignment activity (called when mentor is allocated to enquiry)
const createAssignmentActivity = async (mentorId, enquiryId, allocatedBy, meetingSchedule) => {
  try {
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      console.error('Enquiry not found for assignment activity:', enquiryId);
      return null;
    }

    // Check if assignment already exists to avoid duplicates
    const existing = await MentorActivity.findOne({
      mentorId,
      enquiryId,
      activityType: 'assignment',
      status: 'active'
    });

    if (existing) {
      console.log('Assignment already exists, skipping duplicate creation');
      return existing;
    }

    const activity = new MentorActivity({
      mentorId,
      activityType: 'assignment',
      enquiryId,
      title: enquiry.full_name ? `Mentoring: ${enquiry.full_name}` : undefined,
      description: `Assigned to mentor enquiry for ${enquiry.full_name}`,
      assignedBy: allocatedBy,
      enquiryDetails: {
        enquiryName: enquiry.full_name,
        enquiryId: enquiry._id
      },
      meetingSchedule: meetingSchedule ? new Date(meetingSchedule) : undefined,
      date: new Date(),
      status: 'active',
      createdBy: allocatedBy
    });

    await activity.save();
    console.log(`✅ Assignment activity created for mentor ${mentorId}`);
    return activity;
  } catch (error) {
    console.error('Error creating assignment activity:', error);
    return null;
  }
};

module.exports = {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  assignMenteesToMentor,
  getMentorActivities,
  logMentorActivity,
  getMentorAssignments,
  createAssignmentActivity,
  completeAssignment,
  getAssignmentDetail,
  addAssignmentLog,
}; 