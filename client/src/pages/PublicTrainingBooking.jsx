import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, CurrencyPoundIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';

const PublicTrainingBooking = () => {
  const { bookingLink } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [bookingLink]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/training/public/${bookingLink}`);
      if (!response.ok) {
        throw new Error('Training event not found or not available');
      }
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (participantData) => {
    try {
      const response = await fetch('/api/training/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingEventId: event._id,
          participant: participantData,
          bookingMethod: 'public_link'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Booking failed');
      }

      setBookingSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EAB2C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading training event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Available</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#2EAB2C] text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for registering for "{event.title}". You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#2EAB2C] text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-600 text-lg">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
              )}

              {event.virtualMeetingLink && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-500 mt-0.5">💻</div>
                  <div>
                    <p className="font-medium text-gray-900">Virtual Meeting</p>
                    <a 
                      href={event.virtualMeetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <UserGroupIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Capacity</p>
                  <p className="text-gray-600">
                    Maximum {event.maxParticipants} participants
                  </p>
                </div>
              </div>

              {event.price > 0 && (
                <div className="flex items-start gap-3">
                  <CurrencyPoundIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Price</p>
                    <p className="text-gray-600">
                      £{event.price} {event.currency}
                    </p>
                  </div>
                </div>
              )}

              {event.trainer && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-500 mt-0.5">👨‍🏫</div>
                  <div>
                    <p className="font-medium text-gray-900">Trainer</p>
                    <p className="text-gray-600">{event.trainer.name}</p>
                  </div>
                </div>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="mt-6">
                <p className="font-medium text-gray-900 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Register for Training</h2>
            
            {!showBookingForm ? (
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Ready to join this training session? Click below to register.
                </p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-[#2EAB2C] text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Register Now
                </button>
              </div>
            ) : (
              <BookingForm 
                event={event}
                onSubmit={handleBooking}
                onCancel={() => setShowBookingForm(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingForm = ({ event, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(form);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({...form, phone: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization
        </label>
        <input
          type="text"
          value={form.organization}
          onChange={(e) => setForm({...form, organization: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Role
        </label>
        <input
          type="text"
          value={form.role}
          onChange={(e) => setForm({...form, role: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2EAB2C] focus:border-transparent"
        />
      </div>

      {event.price > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            This training has a fee of £{event.price}. An invoice will be generated after registration.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#2EAB2C] text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Complete Registration'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PublicTrainingBooking;
