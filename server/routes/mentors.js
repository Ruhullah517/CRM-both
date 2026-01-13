const express = require('express');
const router = express.Router();
const {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  assignMenteesToMentor,
  getMentorActivities,
  logMentorActivity,
  getMentorAssignments,
  completeAssignment,
  getAssignmentDetail,
  addAssignmentLog,
} = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');

// If a user is a mentor, only allow access to their own mentor record
function restrictMentorToSelf(req, res, next) {
  if (req.user?.role === 'mentor') {
    const allowedId = (req.user.mentorId || req.user._id)?.toString();
    const targetId = req.params?.id || req.params?.mentorId;
    if (targetId && allowedId && allowedId !== targetId) {
      return res.status(403).json({ error: 'Forbidden: mentors can only view their own profile' });
    }
  }
  next();
}

router.get('/', authenticate, authorize('admin', 'manager', 'staff'), getAllMentors);
router.post('/', authenticate, authorize('admin', 'manager', 'staff'), createMentor);

// Activity and assignment routes (must come before /:id route)
router.get('/:id/activities', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, getMentorActivities);
router.post('/:id/activities', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, logMentorActivity);
router.get('/:id/assignments', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, getMentorAssignments);
router.get('/:id/assignments/:assignmentId', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, getAssignmentDetail);
router.post('/:id/assignments/:assignmentId/logs', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, addAssignmentLog);
router.put('/:id/assignments/:assignmentId/complete', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, completeAssignment);

router.get('/:id', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, getMentorById);
router.put('/:id', authenticate, authorize('admin', 'manager', 'staff', 'mentor'), restrictMentorToSelf, updateMentor);
router.put('/:id/assign-mentees', authenticate, authorize('admin', 'manager', 'staff'), assignMenteesToMentor);
router.delete('/:id', authenticate, authorize('admin', 'manager'), deleteMentor);

module.exports = router; 