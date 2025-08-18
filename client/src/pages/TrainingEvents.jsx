import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
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
  XMarkIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

// Booking Status Form Component
const BookingStatusForm = ({ booking, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    status: booking.status || 'registered',
    attendance: {
      attended: booking.attendance?.attended || false,
      attendanceDate: booking.attendance?.attendanceDate ? new Date(booking.attendance.attendanceDate).toISOString().split('T')[0] : '',
      duration: booking.attendance?.duration || '',
      notes: booking.attendance?.notes || ''
    },
    completion: {
      completed: booking.completion?.completed || false,
      completionDate: booking.completion?.completionDate ? new Date(booking.completion.completionDate).toISOString().split('T')[0] : ''
    },
    payment: {
      status: booking.payment?.status || 'pending'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(booking._id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Update Section */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Status Update
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Booking Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="registered">Registered</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Attendance Update Section */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Attendance Update
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="attended"
              checked={formData.attendance.attended}
              onChange={(e) => setFormData({
                ...formData,
                attendance: { ...formData.attendance, attended: e.target.checked }
              })}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="attended" className="text-sm font-medium text-gray-700">
              Attended the training
            </label>
          </div>
          
          {formData.attendance.attended && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={formData.attendance.attendanceDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    attendance: { ...formData.attendance, attendanceDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.attendance.duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    attendance: { ...formData.attendance, duration: e.target.value }
                  })}
                  placeholder="e.g., 2.5 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Notes
            </label>
            <textarea
              value={formData.attendance.notes}
              onChange={(e) => setFormData({
                ...formData,
                attendance: { ...formData.attendance, notes: e.target.value }
              })}
              placeholder="Any additional notes about attendance..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Completion Update Section */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Completion Update
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completion.completed}
              onChange={(e) => setFormData({
                ...formData,
                completion: { ...formData.completion, completed: e.target.checked }
              })}
              className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700">
              Completed the training
            </label>
          </div>
          
          {formData.completion.completed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completion.completionDate}
                onChange={(e) => setFormData({
                  ...formData,
                  completion: { ...formData.completion, completionDate: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Status Section */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
          Payment Status
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={formData.payment.status}
            onChange={(e) => setFormData({
              ...formData,
              payment: { ...formData.payment, status: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : (
            'Save & Update Status'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400 disabled:opacity-50 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

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
  const [showBookings, setShowBookings] = useState(false);
  const [selectedEventBookings, setSelectedEventBookings] = useState([]);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEventForEmail, setSelectedEventForEmail] = useState(null);
  const [emailData, setEmailData] = useState({ email: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedEventForImport, setSelectedEventForImport] = useState(null);
  const [eventFeedback, setEventFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventFeedback(selectedEvent._id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/training/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const response = await api.post('/training/events', eventData);
      if (response.status === 201 || response.status === 200) {
        fetchEvents();
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleUpdateEvent = async (id, eventData) => {
    try {
      const response = await api.put(`/training/events/${id}`, eventData);
      if (response.status === 200) {
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
      const response = await api.delete(`/training/events/${id}`);
      if (response.status === 200) {
        fetchEvents();
        alert('Training event deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error.response?.data?.msg && error.response.data.msg.includes('existing bookings')) {
        const deleteWithBookings = window.confirm(
          'This training event has existing bookings. Would you like to delete the event and all its bookings? This action cannot be undone.'
        );
        if (deleteWithBookings) {
          try {
            const response = await api.delete(`/training/events/${id}/force`);
            if (response.status === 200) {
              fetchEvents();
              alert('Training event and all bookings deleted successfully!');
            }
          } catch (forceDeleteError) {
            console.error('Error force deleting event:', forceDeleteError);
            alert('Error deleting training event with bookings. Please try again.');
          }
        }
      } else if (error.response?.data?.msg) {
        alert(`Error: ${error.response.data.msg}`);
      } else {
        alert('Error deleting training event. Please try again.');
      }
    }
  };

  const handleViewBookings = async (eventId) => {
    setLoadingBookings(true);
    try {
      const response = await api.get(`/training/events/${eventId}/bookings`);
      setSelectedEventBookings(response.data);
      setCurrentEventId(eventId);
      setShowBookings(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleGenerateCertificates = async (eventId) => {
    if (!window.confirm('Generate certificates for all completed bookings without certificates?')) return;
    
    try {
      const response = await api.post(`/training/events/${eventId}/generate-certificates`);
      alert(response.data.message);
      // Refresh bookings list if modal is open
      if (showBookings && currentEventId === eventId) {
        handleViewBookings(eventId);
      }
      // Refresh events to show updated data
      fetchEvents();
    } catch (error) {
      console.error('Error generating certificates:', error);
      alert('Error generating certificates');
    }
  };

  const handleGenerateInvoices = async (eventId) => {
    if (!window.confirm('Generate invoices for all bookings without invoices?')) return;
    
    try {
      const response = await api.post(`/training/events/${eventId}/generate-invoices`);
      alert(response.data.message);
      // Refresh bookings list if modal is open
      if (showBookings && currentEventId === eventId) {
        handleViewBookings(eventId);
      }
      // Refresh events to show updated data
      fetchEvents();
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Error generating invoices');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, updateData) => {
    try {
      setUpdatingBooking(bookingId);
      const response = await api.put(`/training/bookings/${bookingId}`, updateData);
      
      // Refresh bookings list using the stored current event ID
      if (showBookings && currentEventId) {
        handleViewBookings(currentEventId);
      }
      
      setShowUpdateModal(false);
      setSelectedBooking(null);
      alert('Booking status updated successfully!');
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const openUpdateModal = (booking) => {
    setSelectedBooking(booking);
    setShowUpdateModal(true);
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
      const response = await api.post('/training/bookings/bulk-import', {
        trainingEventId,
        participants: importPreview
      });

      setImportResults(response.data);
      
             if (response.status === 200 || response.status === 201) {
         // Refresh events to show updated booking counts
         fetchEvents();
         
         // Refresh bookings list if modal is open for this event
         if (showBookings && currentEventId === trainingEventId) {
           handleViewBookings(trainingEventId);
         }
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
    setSelectedEventForImport(null);
  };

  const openBulkImportModal = (event) => {
    setSelectedEventForImport(event);
    setShowBulkImport(true);
  };

  const fetchEventFeedback = async (eventId) => {
    setLoadingFeedback(true);
    try {
      const response = await api.get(`/feedback/event/${eventId}`);
      setEventFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setEventFeedback([]);
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Email functions
  const openEmailModal = (event) => {
    setSelectedEventForEmail(event);
    setEmailData({ 
      email: '', 
      message: `Hi there,\n\nYou're invited to join our training event: ${event.title}\n\nEvent Details:\n- Date: ${formatDate(event.startDate)} - ${formatDate(event.endDate)}\n- Location: ${event.location || 'TBD'}\n- Price: £${event.price} ${event.currency}\n\nPlease click the booking link below to register:\n${window.location.origin}/training/${event.bookingLink}\n\nBest regards,\nTraining Team` 
    });
    setShowEmailModal(true);
  };

  const sendBookingLinkEmail = async () => {
    if (!emailData.email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await api.post('/training/send-booking-link', {
        eventId: selectedEventForEmail._id,
        email: emailData.email,
        message: emailData.message
      });
      
      alert('Booking link sent successfully!');
      setShowEmailModal(false);
      setSelectedEventForEmail(null);
      setEmailData({ email: '', message: '' });
    } catch (error) {
      console.error('Error sending booking link:', error);
      alert('Error sending booking link');
    } finally {
      setSendingEmail(false);
    }
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

  // Export functions
  const exportTrainingEvents = async () => {
    try {
      const response = await api.get('/export/training-events', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'training-events.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting training events:', error);
      alert('Error exporting data');
    }
  };

  const exportTrainingBookings = async (eventId = null) => {
    try {
      const apiUrl = eventId 
        ? `/export/training-bookings?eventId=${eventId}`
        : '/export/training-bookings';
        
      const response = await api.get(apiUrl, {
        responseType: 'blob'
      });
      
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', eventId ? `training-bookings-event-${eventId}.csv` : 'training-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting training bookings:', error);
      alert('Error exporting data');
    }
  };

  const exportPaymentHistory = async () => {
    try {
      const response = await api.get('/export/payment-history', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment-history.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting payment history:', error);
      alert('Error exporting data');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training Events</h1>
                 <div className="flex gap-2">
           <button
             onClick={exportTrainingEvents}
             className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
           >
             <ArrowDownTrayIcon className="w-5 h-5" />
             Export Events
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
               
               {/* Quick Rating Display - Placeholder for now */}
               {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                 <StarIcon className="w-4 h-4 text-yellow-400" />
                 <span>4.2 (12 reviews)</span>
               </div> */}
              
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

                         <div className="flex gap-2 flex-wrap">
               <button
                 onClick={() => setSelectedEvent(event)}
                 className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200"
               >
                 <EyeIcon className="w-4 h-4 inline mr-1" />
                 View
               </button>
               <button
                 onClick={() => handleViewBookings(event._id)}
                 className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded text-sm font-medium hover:bg-green-200"
               >
                 <ClipboardDocumentListIcon className="w-4 h-4 inline mr-1" />
                 Bookings
               </button>
               <button
                 onClick={() => openEmailModal(event)}
                 className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded text-sm font-medium hover:bg-indigo-200"
               >
                 <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                 Send Link
               </button>
               <button
                 onClick={() => openBulkImportModal(event)}
                 className="flex-1 bg-cyan-100 text-cyan-700 px-3 py-2 rounded text-sm font-medium hover:bg-cyan-200"
               >
                 <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                 Import
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
           feedback={eventFeedback}
           loadingFeedback={loadingFeedback}
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

               {selectedEventForImport && (
                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                   <h3 className="font-semibold text-blue-900 mb-2">Selected Training Event:</h3>
                   <p className="text-blue-800"><strong>{selectedEventForImport.title}</strong></p>
                   <p className="text-blue-700 text-sm">{formatDate(selectedEventForImport.startDate)} - {formatDate(selectedEventForImport.endDate)}</p>
                 </div>
               )}

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
                     <button
                       onClick={() => handleBulkImport(selectedEventForImport._id)}
                       disabled={importing || !selectedEventForImport}
                       className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {importing ? (
                         <span className="flex items-center justify-center">
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Importing...
                         </span>
                       ) : (
                         `Import ${importPreview.length} Participants to "${selectedEventForImport?.title}"`
                       )}
                     </button>
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

      {/* Bookings Modal */}
      {showBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                             <div className="flex justify-between items-start mb-4">
                 <h2 className="text-xl font-bold">Training Event Bookings</h2>
                 <div className="flex gap-2">
                   <button
                     onClick={() => handleGenerateCertificates(currentEventId)}
                     className="bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-purple-700 flex items-center gap-1"
                   >
                     <AcademicCapIcon className="w-4 h-4" />
                     Generate Certificates
                   </button>
                   <button
                     onClick={() => handleGenerateInvoices(currentEventId)}
                     className="bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-orange-700 flex items-center gap-1"
                   >
                     <DocumentTextIcon className="w-4 h-4" />
                     Generate Invoices
                   </button>
                   <button
                     onClick={() => setShowBookings(false)}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     ✕
                   </button>
                 </div>
               </div>

              {loadingBookings ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p>Loading bookings...</p>
                </div>
              ) : selectedEventBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No bookings found for this training event.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Participant</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Organization</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Attendance</th>
                        <th className="px-4 py-2 text-left">Completion</th>
                        <th className="px-4 py-2 text-left">Payment</th>
                        <th className="px-4 py-2 text-left">Booking Date</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventBookings.map((booking) => (
                        <tr key={booking._id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">
                            {booking.participant.name}
                          </td>
                          <td className="px-4 py-2">{booking.participant.email}</td>
                          <td className="px-4 py-2">{booking.participant.phone || '-'}</td>
                          <td className="px-4 py-2">{booking.participant.organization || '-'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.attendance?.attended ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.attendance?.attended ? 'Attended' : 'Not Attended'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.completion?.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.completion?.completed ? 'Completed' : 'Not Completed'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              booking.payment?.status === 'paid' ? 'bg-green-100 text-green-800' :
                              booking.payment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.payment?.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.payment?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {formatDate(booking.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => openUpdateModal(booking)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                              disabled={updatingBooking === booking._id}
                            >
                              {updatingBooking === booking._id ? 'Updating...' : 'Update Status'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-between">
                <button
                  onClick={() => setShowBookings(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => exportTrainingBookings(currentEventId)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Booking Status Modal */}
      {showUpdateModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Update Booking Status</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Participant:</strong> {selectedBooking.participant.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Email:</strong> {selectedBooking.participant.email}
                </p>
              </div>

              <BookingStatusForm
                booking={selectedBooking}
                onSubmit={handleUpdateBookingStatus}
                onCancel={() => setShowUpdateModal(false)}
                loading={updatingBooking === selectedBooking._id}
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedEventForEmail && (
        <EmailModal
          event={selectedEventForEmail}
          emailData={emailData}
          setEmailData={setEmailData}
          onSend={sendBookingLinkEmail}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedEventForEmail(null);
            setEmailData({ email: '', message: '' });
          }}
          sending={sendingEmail}
        />
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
    maxParticipants: event?.maxParticipants ? parseInt(event.maxParticipants) || 20 : 20,
    price: event?.price ? parseFloat(event.price) || 0 : 0,
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
                <label className="block text-sm font-medium mb-1">Virtual Meeting Link (Optional)</label>
                <input
                  type="url"
                  value={form.virtualMeetingLink}
                  onChange={(e) => setForm({...form, virtualMeetingLink: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Max Participants</label>
                <input
                  type="number"
                  value={form.maxParticipants || ''}
                  onChange={(e) => setForm({...form, maxParticipants: parseInt(e.target.value) || ''})}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={form.price || ''}
                  onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || ''})}
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

  const EventDetailsModal = ({ event, feedback, loadingFeedback, onClose }) => {
    const [activeTab, setActiveTab] = useState('details');

  const getRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const total = feedback.reduce((sum, feedbackItem) => sum + feedbackItem.feedback.overallRating, 0);
    return (total / feedback.length).toFixed(1);
  };

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

           {/* Tabs */}
           <div className="border-b border-gray-200 mb-6">
             <nav className="-mb-px flex space-x-8">
               <button
                 onClick={() => setActiveTab('details')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'details'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Event Details
               </button>
                                <button
                   onClick={() => setActiveTab('feedback')}
                   className={`py-2 px-1 border-b-2 font-medium text-sm ${
                     activeTab === 'feedback'
                       ? 'border-blue-500 text-blue-600'
                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                   }`}
                 >
                   Reviews ({feedback.length})
                 </button>
             </nav>
           </div>

           {activeTab === 'details' && (
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
           )}

           {activeTab === 'feedback' && (
             <div className="space-y-6">
               {/* Feedback Summary */}
               <div className="bg-gray-50 p-4 rounded-lg">
                 <div className="flex items-center gap-4">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-gray-900">{getAverageRating()}</div>
                     <div className="flex justify-center mt-1">
                       {getRatingStars(Math.round(getAverageRating()))}
                     </div>
                     <div className="text-sm text-gray-600 mt-1">
                       {feedback.length} {feedback.length === 1 ? 'review' : 'reviews'}
                     </div>
                   </div>
                   <div className="flex-1">
                     <h3 className="font-semibold text-gray-900 mb-2">Rating Distribution</h3>
                     <div className="space-y-1">
                       {[5, 4, 3, 2, 1].map(rating => {
                         const count = feedback.filter(f => f.feedback.overallRating === rating).length;
                         const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                         return (
                           <div key={rating} className="flex items-center gap-2">
                             <span className="text-sm text-gray-600 w-4">{rating}</span>
                             <div className="flex-1 bg-gray-200 rounded-full h-2">
                               <div 
                                 className="bg-yellow-400 h-2 rounded-full" 
                                 style={{ width: `${percentage}%` }}
                               ></div>
                             </div>
                             <span className="text-sm text-gray-600 w-8">{count}</span>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Feedback List */}
               {loadingFeedback ? (
                 <div className="text-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                   <p>Loading reviews...</p>
                 </div>
               ) : feedback.length === 0 ? (
                 <div className="text-center py-8 text-gray-500">
                   <p>No reviews yet for this training event.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {feedback.map((feedbackItem) => (
                     <div key={feedbackItem._id} className="border border-gray-200 rounded-lg p-4">
                       <div className="flex items-start justify-between mb-3">
                         <div>
                           <h4 className="font-semibold text-gray-900">{feedbackItem.participant.name}</h4>
                           <p className="text-sm text-gray-600">{feedbackItem.participant.email}</p>
                         </div>
                         <div className="flex items-center gap-1">
                           {getRatingStars(feedbackItem.feedback.overallRating)}
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         {feedbackItem.feedback.comments && (
                           <div>
                             <p className="text-gray-800">{feedbackItem.feedback.comments}</p>
                           </div>
                         )}
                         
                         {feedbackItem.feedback.suggestions && (
                           <div>
                             <p className="text-sm text-gray-600">
                               <strong>Suggestions:</strong> {feedbackItem.feedback.suggestions}
                             </p>
                           </div>
                         )}
                         
                         <div className="flex items-center gap-4 text-sm text-gray-600">
                           <span>Submitted: {formatDate(feedbackItem.submittedAt)}</span>
                           {feedbackItem.feedback.wouldRecommend && (
                             <span className="text-green-600">✓ Would recommend</span>
                           )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
           
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

// Email Modal Component
const EmailModal = ({ event, emailData, setEmailData, onSend, onClose, sending }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">Send Booking Link</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Training Event: {event?.title}</h3>
            <p className="text-sm text-gray-600">
              Send the booking link to a customer via email
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email *
              </label>
              <input
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Message
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
                placeholder="Enter your email message..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onSend}
              disabled={sending || !emailData.email.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Email'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingEvents;
