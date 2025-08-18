const CalendarEvent = require('../models/CalendarEvent');

// Get all calendar events
const getAllEvents = async (req, res) => {
  try {
    console.log('Fetching all calendar events...');
    console.log('User ID from request:', req.user?.id);
    
    // Check if CalendarEvent model is available
    if (!CalendarEvent) {
      console.error('CalendarEvent model is not available');
      return res.status(500).json({ msg: 'CalendarEvent model not found' });
    }
    
    const events = await CalendarEvent.find()
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    
    console.log(`Found ${events.length} calendar events`);
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// Get single calendar event
const getEventById = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!event) {
      return res.status(404).json({ msg: 'Calendar event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Create new calendar event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      location,
      attendees,
      notes
    } = req.body;

    const calendarEvent = new CalendarEvent({
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      location,
      attendees,
      notes,
      createdBy: req.user.id
    });

    await calendarEvent.save();
    res.status(201).json(calendarEvent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Update calendar event
const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: new Date() },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ msg: 'Calendar event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Delete calendar event
const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Calendar event not found' });
    }

    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Calendar event deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get events for a specific date range
const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });
    
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange
};
