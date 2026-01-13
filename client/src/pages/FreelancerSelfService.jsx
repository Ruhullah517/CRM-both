import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SERVER_BASE_URL } from '../config/api';
import {
  UserCircleIcon,
  DocumentCheckIcon,
  ClockIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperClipIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import {
  getFreelancerById,
  getFreelancerByEmail,
  updateFreelancer,
  addComplianceDocument,
  updateFreelancerAvailability,
  updateMyAvailability,
} from '../services/freelancers';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const FreelancerSelfService = () => {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceForm, setComplianceForm] = useState({
    name: '',
    type: 'other',
    expiryDate: '',
    file: null
  });

  useEffect(() => {
    if (user?.user?.email) {
      loadFreelancerData();
    }
  }, [user]);

  const loadFreelancerData = async () => {
    setLoading(true);
    try {
      // Get freelancer by email instead of user ID
      const data = await getFreelancerByEmail(user.user.email);
      setFreelancer(data);
      setAvailabilityNotes(data.availabilityNotes || '');
    } catch (err) {
      console.error('Failed to load freelancer data:', err);
      setError('Failed to load freelancer data');
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateFreelancer(freelancer._id, freelancer);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleUpdateAvailability = useCallback(async (availability, notes) => {
    if (!freelancer) {
      setError('Freelancer profile not loaded');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      const result = await updateMyAvailability({
        availability,
        availabilityNotes: notes
      });
      
      setFreelancer(prev => ({
        ...prev,
        availability,
        availabilityNotes: notes
      }));
      setAvailabilityNotes(notes);
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability: ' + (err.response?.data?.msg || err.message));
    }
    setSaving(false);
  }, [freelancer]);

  const handleSaveAvailabilityNotes = useCallback(async () => {
    if (freelancer) {
      await handleUpdateAvailability(freelancer.availability, availabilityNotes);
    }
  }, [freelancer, availabilityNotes, handleUpdateAvailability]);

  const AvailabilityTab = useMemo(() => {
    if (!freelancer) {
      return (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-8">
              <div className="text-gray-500">Loading freelancer profile...</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Management</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Availability</label>
              <div className="flex space-x-4">
                {['available', 'busy', 'unavailable'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateAvailability(status, availabilityNotes)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      freelancer.availability === status
                        ? 'bg-[#2EAB2C] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Availability Notes</label>
            <textarea
              value={availabilityNotes}
              onChange={(e) => setAvailabilityNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes about your availability..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSaveAvailabilityNotes}
                disabled={saving}
                className="px-4 py-2 bg-[#2EAB2C] text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }, [freelancer, availabilityNotes, saving, handleUpdateAvailability, handleSaveAvailabilityNotes]);

  const handleAddComplianceDocument = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', complianceForm.name);
      formData.append('type', complianceForm.type);
      formData.append('expiryDate', complianceForm.expiryDate);
      if (complianceForm.file) {
        formData.append('file', complianceForm.file);
      }

      await addComplianceDocument(freelancer._id, complianceForm);
      setShowComplianceModal(false);
      setComplianceForm({
        name: '',
        type: 'other',
        expiryDate: '',
        file: null
      });
      loadFreelancerData();
    } catch (err) {
      setError('Failed to add compliance document');
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  if (!freelancer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No freelancer profile found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please contact your administrator to set up your freelancer profile.
          </p>
        </div>
      </div>
    );
  }

  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={freelancer.fullName || ''}
                onChange={(e) => setFreelancer({...freelancer, fullName: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={freelancer.email || ''}
                onChange={(e) => setFreelancer({...freelancer, email: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                value={freelancer.mobileNumber || ''}
                onChange={(e) => setFreelancer({...freelancer, mobileNumber: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Location</label>
              <input
                type="text"
                value={freelancer.currentLocation || ''}
                onChange={(e) => setFreelancer({...freelancer, currentLocation: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Home Address</label>
            <textarea
              value={freelancer.homeAddress || ''}
              onChange={(e) => setFreelancer({...freelancer, homeAddress: e.target.value})}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ComplianceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Compliance Documents</h3>
        <button
          onClick={() => setShowComplianceModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2EAB2C] hover:bg-green-700"
        >
          <PaperClipIcon className="h-4 w-4 mr-2" />
          Add Document
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {freelancer.complianceDocuments?.map((doc, index) => (
            <li key={index}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-500">
                      Type: {doc.type} • Uploaded: {formatDate(doc.uploadedAt)}
                    </div>
                    {doc.expiryDate && (
                      <div className={`text-sm ${
                        new Date(doc.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}>
                        Expires: {formatDate(doc.expiryDate)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.fileUrl && (
                      <a
                        href={`${SERVER_BASE_URL}${doc.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2EAB2C] hover:text-green-700"
                      >
                        <DocumentCheckIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Compliance Document Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Compliance Document</h3>
              <form onSubmit={handleAddComplianceDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Name</label>
                  <input
                    type="text"
                    value={complianceForm.name}
                    onChange={(e) => setComplianceForm({...complianceForm, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    value={complianceForm.type}
                    onChange={(e) => setComplianceForm({...complianceForm, type: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  >
                    <option value="dbs">DBS Check</option>
                    <option value="insurance">Insurance</option>
                    <option value="qualification">Qualification</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={complianceForm.expiryDate}
                    onChange={(e) => setComplianceForm({...complianceForm, expiryDate: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setComplianceForm({...complianceForm, file: e.target.files[0]})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowComplianceModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const WorkHistoryTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Work History</h3>
      
      {freelancer.workHistory && freelancer.workHistory.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {freelancer.workHistory.map((work, index) => (
            <li key={index}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{work.assignment}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Ongoing'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {work.hours} hours • £{work.rate}/hr • Total: £{work.totalAmount}
                    </div>
                    {work.notes && (
                      <div className="text-sm text-gray-500 mt-1">{work.notes}</div>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    work.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : work.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {work.status === 'in_progress' ? 'In Progress' : work.status}
                  </span>
                </div>
              </div>
            </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-8 text-center">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No work history recorded yet.</p>
          <p className="text-xs text-gray-500 mt-1">Your assignments will appear here once added by the administrator.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your freelancer profile, availability, and compliance documents
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', name: 'Profile', icon: UserCircleIcon },
            { id: 'availability', name: 'Availability', icon: CalendarIcon },
            { id: 'compliance', name: 'Compliance', icon: DocumentCheckIcon },
            { id: 'work-history', name: 'Work History', icon: ClockIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-[#2EAB2C] text-[#2EAB2C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'availability' && AvailabilityTab}
      {activeTab === 'compliance' && <ComplianceTab />}
      {activeTab === 'work-history' && <WorkHistoryTab />}
    </div>
  );
};

export default FreelancerSelfService;
