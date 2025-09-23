import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, updateEnquiry } from '../services/enquiries';
import { createReminder } from '../services/reminders';
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const InitialAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    result: '',
    notes: '',
    eligibilityChecks: {
      age: false,
      over21: false,
      location: false,
      criminalHistory: false,
      safeguardingConcerns: false
    },
    availability: {
      willingToFoster: false,
      spareRoom: false,
      timesDates: ''
    },
    suitability: {
      caringResponsibilities: false,
      previousInvestigations: false,
      experience: false
    }
  });

  useEffect(() => {
    loadEnquiry();
  }, [id]);

  const loadEnquiry = async () => {
    try {
      const data = await getEnquiryById(id);
      setEnquiry(data);
      
      // Pre-fill form with existing data
      if (data.initialAssessment) {
        setFormData({
          result: data.initialAssessment.result || '',
          notes: data.initialAssessment.notes || '',
          eligibilityChecks: data.initialAssessment.eligibilityChecks || formData.eligibilityChecks,
          availability: data.initialAssessment.availability || formData.availability,
          suitability: data.initialAssessment.suitability || formData.suitability
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
        initialAssessment: assessmentData,
        status: getNextStatus(formData.result)
      });

      // Create follow-up tasks based on result
      if (formData.result === 'Pass') {
        // Create Full Assessment task
        await createReminder({
          title: 'Conduct Full Assessment',
          description: `Full assessment required for ${enquiry.full_name}`,
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          relatedEntityType: 'enquiry',
          relatedEntityId: id
        });

        // Note: Email automation will be triggered server-side when enquiry is updated
      } else if (formData.result === 'Fail') {
        // Create decline email task
        await createReminder({
          title: 'Send Decline Email',
          description: `Send polite decline email to ${enquiry.full_name}`,
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
          relatedEntityType: 'enquiry',
          relatedEntityId: id
        });

        // Note: Email automation will be triggered server-side when enquiry is updated
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
      case 'Pass': return 'Full Assessment';
      case 'Fail': return 'Screen Failed';
      case 'Needs More Info': return 'Initial Assessment';
      default: return 'Initial Assessment';
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
          <h1 className="text-2xl font-bold text-gray-900">Initial Assessment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enquiry: {enquiry.full_name} - {enquiry.email_address}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Eligibility Checks */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Checks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.eligibilityChecks).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`eligibility-${key}`}
                    checked={value}
                    onChange={(e) => handleCheckboxChange('eligibilityChecks', key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`eligibility-${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Availability</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willingToFoster"
                  checked={formData.availability.willingToFoster}
                  onChange={(e) => handleCheckboxChange('availability', 'willingToFoster', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="willingToFoster" className="ml-2 block text-sm text-gray-900">
                  Willing to foster
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="spareRoom"
                  checked={formData.availability.spareRoom}
                  onChange={(e) => handleCheckboxChange('availability', 'spareRoom', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="spareRoom" className="ml-2 block text-sm text-gray-900">
                  Has spare room
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Times/Dates Available</label>
                <input
                  type="text"
                  value={formData.availability.timesDates}
                  onChange={(e) => handleCheckboxChange('availability', 'timesDates', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Weekdays 9-5, Weekends available"
                />
              </div>
            </div>
          </div>

          {/* Suitability */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suitability</h3>
            <div className="space-y-4">
              {Object.entries(formData.suitability).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`suitability-${key}`}
                    checked={value}
                    onChange={(e) => handleCheckboxChange('suitability', key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`suitability-${key}`} className="ml-2 block text-sm text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Result */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Result</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-pass"
                  name="result"
                  value="Pass"
                  checked={formData.result === 'Pass'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="result-pass" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  Pass - Proceed to Full Assessment
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-fail"
                  name="result"
                  value="Fail"
                  checked={formData.result === 'Fail'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <label htmlFor="result-fail" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <XMarkIcon className="h-4 w-4 text-red-500 mr-1" />
                  Fail - Send Decline Email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="result-needs-info"
                  name="result"
                  value="Needs More Info"
                  checked={formData.result === 'Needs More Info'}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                />
                <label htmlFor="result-needs-info" className="ml-2 block text-sm text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  Needs More Info - Follow up required
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
              placeholder="Enter detailed assessment notes..."
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

export default InitialAssessment;
