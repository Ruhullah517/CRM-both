const Feedback = require('../models/Feedback');
const TrainingEvent = require('../models/TrainingEvent');
const TrainingBooking = require('../models/TrainingBooking');

// Submit feedback for a training event
const submitFeedback = async (req, res) => {
  try {
    const { trainingEventId, trainingBookingId, feedback, issues } = req.body;

    // Verify the training booking exists and belongs to the participant
    const booking = await TrainingBooking.findById(trainingBookingId);
    if (!booking) {
      return res.status(404).json({ msg: 'Training booking not found' });
    }

    if (booking.trainingEvent.toString() !== trainingEventId) {
      return res.status(400).json({ msg: 'Invalid training event for this booking' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ trainingBooking: trainingBookingId });
    if (existingFeedback) {
      return res.status(400).json({ msg: 'Feedback already submitted for this booking' });
    }

    const newFeedback = new Feedback({
      trainingEvent: trainingEventId,
      trainingBooking: trainingBookingId,
      participant: {
        name: booking.participant.name,
        email: booking.participant.email
      },
      feedback,
      issues: issues || []
    });

    await newFeedback.save();

    res.status(201).json({ 
      msg: 'Feedback submitted successfully',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all feedback for admin review
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('trainingEvent', 'title startDate endDate')
      .populate('trainingBooking', 'participant status')
      .populate('issues.resolvedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get feedback for a specific training event
const getFeedbackByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const feedback = await Feedback.find({ trainingEvent: eventId })
      .populate('trainingBooking', 'participant status')
      .populate('issues.resolvedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback for event:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  try {
    const { feedbackId, issueIndex, status, resolution } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ msg: 'Feedback not found' });
    }

    if (issueIndex >= feedback.issues.length) {
      return res.status(400).json({ msg: 'Invalid issue index' });
    }

    feedback.issues[issueIndex].status = status;
    if (resolution) {
      feedback.issues[issueIndex].resolution = resolution;
    }
    
    if (status === 'resolved') {
      feedback.issues[issueIndex].resolvedBy = req.user.id;
      feedback.issues[issueIndex].resolvedAt = new Date();
    }

    await feedback.save();

    res.json({ 
      msg: 'Issue status updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const averageRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$feedback.overallRating' }
        }
      }
    ]);

    const issueStats = await Feedback.aggregate([
      { $unwind: '$issues' },
      {
        $group: {
          _id: '$issues.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$feedback.overallRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalFeedback,
      averageRating: averageRating[0]?.avgRating || 0,
      issueStats,
      ratingDistribution
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByEvent,
  updateIssueStatus,
  getFeedbackStats
};
