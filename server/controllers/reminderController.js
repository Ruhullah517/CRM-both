const Reminder = require('../models/Reminder');

exports.createReminder = async (req, res) => {
  try {
    const body = req.body;
    const reminder = new Reminder({
      title: body.title,
      description: body.description,
      dueAt: body.dueAt,
      entityType: body.entityType,
      entityId: body.entityId,
      assignedTo: body.assignedTo || req.user._id,
      createdBy: req.user._id,
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to create reminder' });
  }
};

exports.listReminders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.status) filter.status = req.query.status;
    const reminders = await Reminder.find(filter).sort({ dueAt: 1 });
    res.json(reminders);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to fetch reminders' });
  }
};

exports.completeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Reminder.findByIdAndUpdate(
      id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Reminder not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ msg: 'Failed to complete reminder' });
  }
};


