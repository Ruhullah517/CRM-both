import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  PlusIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import api from '../services/api';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [trainingEvents, setTrainingEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for adding new events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    type: 'training', // training, meeting, deadline, other
    location: '',
    attendees: '',
    notes: ''
  });

  useEffect(() => {
    fetchTrainingEvents();
    fetchEvents();
  }, []);

  const fetchTrainingEvents = async () => {
    try {
      const response = await api.get('/training/events');
      setTrainingEvents(response.data);
    } catch (error) {
      console.error('Error fetching training events:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/calendar/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/calendar/events', formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        type: 'training',
        location: '',
        attendees: '',
        notes: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/calendar/events/${eventId}`);
      fetchEvents();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const allEvents = [
      ...trainingEvents.map(event => ({
        ...event,
        type: 'training',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        title: event.title,
        description: event.description,
        location: event.location
      })),
      ...events.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate)
      }))
    ];

    return allEvents.filter(event => 
      isSameDay(event.startDate, date) || 
      (event.endDate && isSameDay(event.endDate, date)) ||
      (event.startDate <= date && event.endDate >= date)
    );
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'training':
        return <AcademicCapIcon className="w-4 h-4" />;
      case 'meeting':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'deadline':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'case':
        return <BriefcaseIcon className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'training':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'case':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-8 w-8 mr-3 text-blue-500" />
              Calendar
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage training events and other calendar items
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            ← Previous
          </button>
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            Next →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] p-2 border border-gray-200 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  setShowAddModal(true);
                }}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={event._id || index}
                      className={`text-xs p-1 rounded border cursor-pointer ${getEventColor(event.type)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-3">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getEventColor('training')}`}></div>
            <span className="text-sm">Training Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getEventColor('meeting')}`}></div>
            <span className="text-sm">Meetings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getEventColor('deadline')}`}></div>
            <span className="text-sm">Deadlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${getEventColor('case')}`}></div>
            <span className="text-sm">Case Events</span>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDate ? `Add Event for ${format(selectedDate, 'MMM dd, yyyy')}` : 'Add New Event'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={createEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="training">Training</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="case">Case Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Attendees</label>
                  <input
                    type="text"
                    value={formData.attendees}
                    onChange={(e) => setFormData({...formData, attendees: e.target.value})}
                    placeholder="Comma-separated list of attendees"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getEventIcon(selectedEvent.type)}
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getEventColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-lg">{selectedEvent.title}</h4>
                  {selectedEvent.description && (
                    <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <p className="text-sm text-gray-900">
                      {format(selectedEvent.startDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {selectedEvent.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <p className="text-sm text-gray-900">
                        {format(selectedEvent.endDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedEvent.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.attendees && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attendees</label>
                    <p className="text-sm text-gray-900">{selectedEvent.attendees}</p>
                  </div>
                )}

                {selectedEvent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedEvent.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {selectedEvent.type !== 'training' && (
                    <button
                      onClick={() => deleteEvent(selectedEvent._id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
