import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, updateEnquiry } from '../services/enquiries';
import { createReminder } from '../services/reminders';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const FullAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    result: '',
    notes: '',
    backgroundChecks: {
      dbs: false,
      references: false,
      homeSafety: false
    },
    personalHistory: '',
    supportNeeds: '',
    trainingNeeds: '',
    documents: []
  });

  useEffect(() => {
    loadEnquiry();
  }, [id]);

  const loadEnquiry = async () => {
    try {
      const data = await getEnquiryById(id);
      setEnquiry(data);
      
      // Pre-fill form with existing data
      if (data.fullAssessment) {
        setFormData({
          result: data.fullAssessment.result || '',
          notes: data.fullAssessment.notes || '',
          backgroundChecks: data.fullAssessment.backgroundChecks || formData.backgroundChecks,
          personalHistory: data.fullAssessment.personalHistory || '',
          supportNeeds: data.fullAssessment.supportNeeds || '',
          trainingNeeds: data.fullAssessment.trainingNeeds || '',
          documents: data.fullAssessment.documents || []
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
      const assessmentData = {
        ...formData,
        assessorId: JSON.parse(localStorage.getItem('user')).id,
        assessmentDate: new Date()
      };

      // Update enquiry with assessment
      const updatedEnquiry = await updateEnquiry(id, {
        fullAssessment: assessmentData,
        status: getNextStatus(formData.result)
      });

      // Create follow-up tasks based on result
      if (formData.result === 'Proceed') {
        // Create mentor allocation task
        await createReminder({
          title: 'Allocate Mentor',
          description: `Allocate mentor for ${enquiry.full_name}`,
          dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          relatedEntityType: 'enquiry',
          relatedEntityId: id
        });

        // Note: Email automation will be triggered server-side when enquiry is updated
      } else if (formData.result === 'Do not proceed') {
        // Create decline email task
        await createReminder({
          title: 'Send Decline Email',
          description: `Send decline email to ${enquiry.full_name}`,
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          relatedEntityType: 'enquiry',
          relatedEntityId: id
        });

        // Note: Email automation will be triggered server-side when enquiry is updated
      } else if (formData.result === 'Hold') {
        // Create follow-up task
        await createReminder({
          title: 'Follow up on Hold Status',
          description: `Follow up on hold status for ${enquiry.full_name}`,
          dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          relatedEntityType: 'enquiry',
          relatedEntityId: id
        });
      }

      navigate('/enquiries');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Error submitting assessment: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (result) => {
    switch (result) {
      case 'Proceed': return 'Mentor Allocation';
      case 'Do not proceed': return 'Assessment Fail';
      case 'Hold': return 'On Hold';
      default: return 'Full Assessment';
    }
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">Full Assessment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enquiry: {enquiry.full_name} - {enquiry.email_address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Background Checks */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Background Checks</h3>
            <div className="space-y-4">
              {Object.entries(formData.backgroundChecks).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`background-${key}`}
                    checked={value}
                    onChange={(e) => handleCheckboxChange('backgroundChecks', key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`background-${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                    {key === 'dbs' ? 'DBS Check' : key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Personal History */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Personal History & Motivations</label>
            <textarea
              value={formData.personalHistory}
              onChange={(e) => setFormData({ ...formData, personalHistory: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed personal history and motivations..."
            />
          </div>

          {/* Support Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Needs</label>
            <textarea
              value={formData.supportNeeds}
              onChange={(e) => setFormData({ ...formData, supportNeeds: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter support needs and access requirements..."
            />
          </div>

          {/* Training Needs */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Training Needs</label>
            <textarea
              value={formData.trainingNeeds}
              onChange={(e) => setFormData({ ...formData, trainingNeeds: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter training needs and requirements..."
            />
          </div>

          {/* Assessment Result */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Recommendation</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-proceed"
                  name="result"
                  value="Proceed"
                  checked={formData.result === 'Proceed'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="result-proceed" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  Proceed - Allocate mentor and ongoing support
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-do-not-proceed"
                  name="result"
                  value="Do not proceed"
                  checked={formData.result === 'Do not proceed'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="result-do-not-proceed" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                  Do not proceed - Record reason and notify applicant
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-hold"
                  name="result"
                  value="Hold"
                  checked={formData.result === 'Hold'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <label htmlFor="result-hold" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  Hold - Log required actions and follow up
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assessment Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter detailed assessment notes and meeting summary..."
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
              disabled={loading || !formData.result}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FullAssessment;
