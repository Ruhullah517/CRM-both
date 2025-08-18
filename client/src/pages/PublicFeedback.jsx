import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const PublicFeedback = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [feedback, setFeedback] = useState({
    overallRating: 0,
    contentRating: 0,
    trainerRating: 0,
    venueRating: 0,
    comments: '',
    suggestions: '',
    wouldRecommend: true
  });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/training/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Booking not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (ratingType, value) => {
    setFeedback(prev => ({
      ...prev,
      [ratingType]: value
    }));
  };

  const getRatingStars = (rating, ratingType) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-6 h-6 cursor-pointer ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        onClick={() => handleRatingChange(ratingType, i + 1)}
      />
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (feedback.overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback/submit', {
        trainingEventId: booking.trainingEvent._id,
        trainingBookingId: booking._id,
        feedback,
        issues: []
      });

      alert('Thank you for your feedback!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-4">The booking link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Feedback</h1>
            <p className="text-gray-600">
              Thank you for completing our training. Your feedback helps us improve our programs.
            </p>
          </div>

          {/* Training Event Details */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event Title</p>
                <p className="font-medium">{booking.trainingEvent.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Participant</p>
                <p className="font-medium">{booking.participant.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-medium">
                  {formatDate(booking.trainingEvent.startDate)} - {formatDate(booking.trainingEvent.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Date</p>
                <p className="font-medium">
                  {booking.completion?.completionDate ? formatDate(booking.completion.completionDate) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Overall Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating *</h3>
              <div className="flex items-center gap-2 mb-2">
                {getRatingStars(feedback.overallRating, 'overallRating')}
                <span className="ml-2 text-sm text-gray-600">
                  {feedback.overallRating > 0 ? `${feedback.overallRating}/5` : 'Click to rate'}
                </span>
              </div>
              <p className="text-sm text-gray-500">How would you rate your overall training experience?</p>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Content Quality</h4>
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(feedback.contentRating, 'contentRating')}
                </div>
                <p className="text-xs text-gray-500">Training materials and content</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Trainer</h4>
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(feedback.trainerRating, 'trainerRating')}
                </div>
                <p className="text-xs text-gray-500">Trainer knowledge and delivery</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Venue/Facilities</h4>
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(feedback.venueRating, 'venueRating')}
                </div>
                <p className="text-xs text-gray-500">Training environment and facilities</p>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="What did you like most about the training?"
              />
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggestions for Improvement</h3>
              <textarea
                value={feedback.suggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="How could we improve this training program?"
              />
            </div>

            {/* Would Recommend */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={feedback.wouldRecommend}
                    onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                    className="mr-2"
                  />
                  Yes, I would recommend this training
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!feedback.wouldRecommend}
                    onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                    className="mr-2"
                  />
                  No, I would not recommend this training
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting || feedback.overallRating === 0}
                className="bg-[#2EAB2C] text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFeedback;
