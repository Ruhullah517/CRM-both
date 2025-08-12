import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  LinkIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const TrainingEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/training/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await fetch('/api/training/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        fetchEvents();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (id, eventData) => {
    try {
      const response = await fetch(`/api/training/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        fetchEvents();
        setEditingEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training event?')) return;
    
    try {
      const response = await fetch(`/api/training/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Bulk Import Functions
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportFile(file);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const participants = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const participant = {};
          headers.forEach((header, index) => {
            participant[header.toLowerCase()] = values[index] || '';
          });
          return participant;
        });

      setImportPreview(participants);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async (trainingEventId) => {
    if (!importPreview.length) return;

    setImporting(true);
    try {
      const response = await fetch('/api/training/bookings/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          trainingEventId,
          participants: importPreview
        })
      });

      const result = await response.json();
      setImportResults(result);
      
      if (response.ok) {
        // Refresh events to show updated booking counts
        fetchEvents();
      }
    } catch (error) {
      console.error('Error importing participants:', error);
      setImportResults({ error: 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  const resetBulkImport = () => {
    setImportFile(null);
    setImportPreview([]);
    setImportResults(null);
    setShowBulkImport(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training Events</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkImport(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#2EAB2C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <PlusIcon className="w-5 h-5" />
            Create Event
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4">📍</div>
                  <span>{event.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserGroupIcon className="w-4 h-4" />
                <span>Max: {event.maxParticipants} participants</span>
              </div>
              
              {event.price > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CurrencyPoundIcon className="w-4 h-4" />
                  <span>{event.price} {event.currency}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEvent(event)}
                className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200"
              >
                <EyeIcon className="w-4 h-4 inline mr-1" />
                View
              </button>
              <button
                onClick={() => setEditingEvent(event)}
                className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-2 rounded text-sm font-medium hover:bg-yellow-200"
              >
                <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteEvent(event._id)}
                className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm font-medium hover:bg-red-200"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingEvent) && (
        <TrainingEventForm
          event={editingEvent}
          users={users}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Bulk Import Participants</h2>
                <button 
                  onClick={resetBulkImport} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {!importFile ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Upload CSV File</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a CSV file with participant details. The file should have headers like: name, email, phone, organization, role, status, attended, completed, etc.
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">CSV Format Example:</h4>
                    <pre className="text-xs text-gray-600">
{`name,email,phone,organization,role,status,attended,completed
John Doe,john@example.com,1234567890,ABC Corp,Manager,registered,true,false
Jane Smith,jane@example.com,0987654321,XYZ Inc,Director,confirmed,false,false`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Preview ({importPreview.length} participants)</h3>
                    <button
                      onClick={() => setImportFile(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Change File
                    </button>
                  </div>

                  {importPreview.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {Object.keys(importPreview[0]).map(header => (
                              <th key={header} className="px-3 py-2 text-left font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0, 10).map((participant, index) => (
                            <tr key={index} className="border-t">
                              {Object.values(participant).map((value, i) => (
                                <td key={i} className="px-3 py-2">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importPreview.length > 10 && (
                        <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50">
                          Showing first 10 of {importPreview.length} participants
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Select Training Event</h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkImport(e.target.value);
                        }
                      }}
                      disabled={importing}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Choose a training event...</option>
                      {events
                        .filter(event => event.status === 'published')
                        .map(event => (
                          <option key={event._id} value={event._id}>
                            {event.title} ({formatDate(event.startDate)})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {importing && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p>Importing participants...</p>
                    </div>
                  )}

                  {importResults && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Import Results</h4>
                      {importResults.error ? (
                        <p className="text-red-600">{importResults.error}</p>
                      ) : (
                        <div>
                          <p className="text-green-600 mb-2">Import completed!</p>
                          <div className="text-sm">
                            {importResults.results?.map((result, index) => (
                              <div key={index} className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                {result.participant}: {result.success ? 'Success' : `Failed - ${result.error}`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={resetBulkImport}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TrainingEventForm = ({ event, users, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    trainer: event?.trainer || '',
    location: event?.location || '',
    virtualMeetingLink: event?.virtualMeetingLink || '',
    startDate: event?.startDate ? event.startDate.slice(0, 16) : '',
    endDate: event?.endDate ? event.endDate.slice(0, 16) : '',
    maxParticipants: event?.maxParticipants || 20,
    price: event?.price || 0,
    currency: event?.currency || 'GBP',
    status: event?.status || 'draft',
    tags: event?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()) : []
    };
    
    if (event) {
      onSubmit(event._id, eventData);
    } else {
      onSubmit(eventData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {event ? 'Edit Training Event' : 'Create Training Event'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trainer</label>
                <select
                  value={form.trainer}
                  onChange={(e) => setForm({...form, trainer: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Trainer</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({...form, startDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({...form, endDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({...form, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Virtual Meeting Link</label>
                <input
                  type="url"
                  value={form.virtualMeetingLink}
                  onChange={(e) => setForm({...form, virtualMeetingLink: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants</label>
                <input
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => setForm({...form, maxParticipants: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({...form, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({...form, tags: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., foster care, assessment, training"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#2EAB2C] text-white py-2 rounded-lg hover:bg-green-700"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EventDetailsModal = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{event.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Event Details</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Start Date:</strong> {formatDate(event.startDate)}</p>
                <p><strong>End Date:</strong> {formatDate(event.endDate)}</p>
                <p><strong>Location:</strong> {event.location || 'Not specified'}</p>
                <p><strong>Max Participants:</strong> {event.maxParticipants}</p>
                <p><strong>Price:</strong> £{event.price} {event.currency}</p>
                <p><strong>Status:</strong> {event.status}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Booking Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Booking Link:</strong></p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/training/${event.bookingLink}`}
                    readOnly
                    className="flex-1 px-2 py-1 border rounded text-xs"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/training/${event.bookingLink}`)}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.open(`/training/${event.bookingLink}`, '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Public Page
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingEvents;
