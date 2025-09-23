import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, updateEnquiry } from '../services/enquiries';

const CaseClosure = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    closureReason: '',
    outcomes: '',
    lessonsLearned: '',
    finalReport: ''
  });

  useEffect(() => {
    loadEnquiry();
  }, [id]);

  const loadEnquiry = async () => {
    try {
      const data = await getEnquiryById(id);
      setEnquiry(data);
      
      // Pre-fill form with existing data
      if (data.caseClosure) {
        setFormData({
          closureReason: data.caseClosure.closureReason || '',
          outcomes: data.caseClosure.outcomes || '',
          lessonsLearned: data.caseClosure.lessonsLearned || '',
          finalReport: data.caseClosure.finalReport || ''
        });
      }
    } catch (error) {
      console.error('Error loading enquiry:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const closureData = {
        ...formData,
        closureDate: new Date(),
        closedBy: JSON.parse(localStorage.getItem('user')).id
      };

      // Update enquiry with closure data
      const updatedEnquiry = await updateEnquiry(id, {
        caseClosure: closureData,
        status: 'Closed'
      });

      // Note: Email automation will be triggered server-side when enquiry is updated

      navigate('/enquiries');
    } catch (error) {
      console.error('Error submitting case closure:', error);
      alert('Error submitting case closure: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!enquiry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Case Closure</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enquiry: {enquiry.full_name} - {enquiry.email_address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Closure Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Closure Reason</label>
            <select
              value={formData.closureReason}
              onChange={(e) => setFormData({ ...formData, closureReason: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select closure reason</option>
              <option value="mentoring_objectives_met">Mentoring objectives met</option>
              <option value="participant_withdrew">Participant withdrew</option>
              <option value="unsolvable_issues">Unsolvable issues</option>
              <option value="assessment_failed">Assessment failed</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Outcomes</label>
            <textarea
              value={formData.outcomes}
              onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the outcomes achieved during this case..."
              required
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Lessons Learned</label>
            <textarea
              value={formData.lessonsLearned}
              onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What lessons were learned from this case that could improve future processes?"
            />
          </div>

          {/* Final Report */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Final Report</label>
            <textarea
              value={formData.finalReport}
              onChange={(e) => setFormData({ ...formData, finalReport: e.target.value })}
              rows={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide a comprehensive final report summarizing the case..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/enquiries')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Closing Case...' : 'Close Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseClosure;
