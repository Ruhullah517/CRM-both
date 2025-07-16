const Activity = require('../models/Activity');

// Log a new activity
const logActivity = async (req, res) => {
  try {
    const { caseId, type, date, caseworker, description, timeSpent } = req.body;
    const activity = new Activity({
      caseId,
      type,
      date,
      caseworker,
      description,
      timeSpent
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get all activities for a case
const getActivitiesByCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const activities = await Activity.find({ caseId }).populate('caseworker', 'name email');
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  logActivity,
  getActivitiesByCase
}; 