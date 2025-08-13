import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const Feedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/feedback');
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Training Feedback</h1>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Feedback</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-gray-900 mr-2">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0'}
              </p>
              <div className="flex">
                {getRatingStars(Math.round(stats.averageRating || 0))}
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Open Issues</h3>
            <p className="text-2xl font-bold text-red-600">
              {stats.issueStats?.find(s => s._id === 'open')?.count || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Feedback</h2>
          
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No feedback submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((feedbackItem) => (
                <div key={feedbackItem._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {feedbackItem.participant.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {feedbackItem.participant.email}
                        </span>
                        <div className="flex items-center">
                          {getRatingStars(feedbackItem.feedback.overallRating)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Training:</strong> {feedbackItem.trainingEvent?.title}
                      </p>
                      
                      {feedbackItem.feedback.comments && (
                        <p className="text-sm text-gray-700 mb-2">
                          "{feedbackItem.feedback.comments}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Submitted: {formatDate(feedbackItem.submittedAt)}</span>
                        {feedbackItem.issues.length > 0 && (
                          <span className="text-red-600">
                            {feedbackItem.issues.length} issue(s) reported
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
