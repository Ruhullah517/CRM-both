const Activity = require('../models/Activity');

// Log a new activity
const logActivity = async (req, res) => {
  try {
    const { id: caseId } = req.params; // Get caseId from URL parameters (route uses :id)
    const { type, date, caseworker, description, timeSpent } = req.body;
    
    console.log('Activity data received:');
    console.log('caseId:', caseId);
    console.log('caseworker:', caseworker);
    console.log('type:', type);
    console.log('description:', description);
    console.log('timeSpent:', timeSpent);
    console.log('date:', date);
    
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
    const { id: caseId } = req.params; // Get caseId from URL parameters (route uses :id)
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