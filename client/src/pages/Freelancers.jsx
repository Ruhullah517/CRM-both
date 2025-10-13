import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { 
  getFreelancers, 
  createFreelancer, 
  updateFreelancer, 
  deleteFreelancer,
  updateFreelancerAvailability,
  addComplianceDocument,
  deleteComplianceDocument,
  addWorkHistory,
  getExpiringCompliance,
  updateContractRenewal,
  updateFreelancerStatus,
  createUserAccountForFreelancer
} from '../services/freelancers';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const roles = ['Trainer', 'Mentor'];
const statuses = ['Active', 'Inactive'];
const availabilities = ['Available', 'Unavailable'];

const statusColors = {
  Active: 'bg-green-100 text-[#2EAB2C]',
  Inactive: 'bg-gray-200 text-gray-800',
};
const availabilityColors = {
  available: 'bg-green-100 text-[#2EAB2C]',
  unavailable: 'bg-yellow-100 text-yellow-800',
};

const FreelancerList = ({ onSelect, onAdd, freelancers, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = freelancers.filter(f =>
    f.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input
          placeholder="Search freelancers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-full sm:w-64"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition w-full sm:w-auto"
        >
          Add Freelancer
        </button>
      </div>

      {/* Table for sm and up */}
      <div className="overflow-x-auto rounded shadow bg-white hidden sm:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Geographical Location</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{f.fullName}</td>
                <td className="px-4 py-2">{f.email}</td>
                <td className="px-4 py-2">{f.role}</td>
                <td className="px-4 py-2">{f.geographicalLocation}</td>
                <td className="px-4 py-2">{f.mobileNumber}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onSelect(f)}
                    className="px-3 py-1 rounded bg-black text-white font-semibold hover:bg-gray-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {filtered.map(f => (
          <div
            key={f._id}
            className="rounded shadow bg-white p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{f.fullName}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[f.status] || "bg-gray-100 text-gray-700"
                  }`}
              >
                {f.status}
              </span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Email:</span> {f.email}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Role:</span> {f.role}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Location:</span> {f.geographicalLocation}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Mobile:</span> {f.mobileNumber}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onSelect(f)}
                className="flex-1 px-3 py-2 rounded bg-black text-white font-semibold hover:bg-gray-600"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FreelancerDetail = ({ freelancer, onBack, onEdit, onDelete, backendBaseUrl }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showWorkHistoryModal, setShowWorkHistoryModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);

  // Helper function to display document type in friendly format
  const getDocumentTypeLabel = (type) => {
    const typeLabels = {
      'dbs': 'DBS Certificate',
      'qualification': 'Qualification',
      'insurance': 'Insurance',
      'other': 'Other'
    };
    return typeLabels[type] || type;
  };

  // Form states
  const [availabilityForm, setAvailabilityForm] = useState({
    hourlyRate: freelancer.hourlyRate || 0,
    dailyRate: freelancer.dailyRate || 0,
    availability: freelancer.availability || 'available',
    availabilityNotes: freelancer.availabilityNotes || ''
  });

  const [contractForm, setContractForm] = useState({
    contractRenewalDate: freelancer.contractRenewalDate ? formatDateForInput(freelancer.contractRenewalDate) : '',
    contractStatus: freelancer.contractStatus || 'active'
  });

  const [complianceForm, setComplianceForm] = useState({
    name: '',
    type: 'dbs',
    expiryDate: '',
    file: null
  });

  const [workHistoryForm, setWorkHistoryForm] = useState({
    assignment: '',
    startDate: '',
    endDate: '',
    hours: '',
    rate: freelancer.hourlyRate || '',
    notes: ''
  });

  const availabilityColors = {
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-red-100 text-red-800'
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await updateFreelancerAvailability(freelancer._id, availabilityForm);
      setShowAvailabilityModal(false);
      window.location.reload(); // Reload to show updated data
    } catch (err) {
      setModalError('Failed to update availability');
    }
    setSaving(false);
  };

  const handleUpdateContract = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await updateContractRenewal(freelancer._id, contractForm);
      setShowContractModal(false);
      window.location.reload();
    } catch (err) {
      setModalError('Failed to update contract');
    }
    setSaving(false);
  };

  const handleAddCompliance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await addComplianceDocument(freelancer._id, complianceForm);
      setShowComplianceModal(false);
      setComplianceForm({
        name: '',
        type: 'dbs',
        expiryDate: '',
        file: null
      });
      window.location.reload();
    } catch (err) {
      setModalError('Failed to add compliance document');
    }
    setSaving(false);
  };

  const handleDeleteCompliance = async (documentIndex) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    setSaving(true);
    try {
      await deleteComplianceDocument(freelancer._id, documentIndex);
      window.location.reload(); // Reload to show updated data
    } catch (err) {
      alert('Failed to delete document');
    }
    setSaving(false);
  };

  const handleCreateUserAccount = async () => {
    if (!window.confirm(`Create a User account for ${freelancer.fullName}?\n\nThis will:\n• Generate login credentials\n• Send credentials to ${freelancer.email}\n• Allow them to access the CRM portal\n\nProceed?`)) return;
    
    setCreatingUser(true);
    try {
      const result = await createUserAccountForFreelancer(freelancer._id);
      alert(`User account created successfully!\n\nLogin Credentials:\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.password}\n\n(Credentials have also been sent to the freelancer's email)`);
      window.location.reload();
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Failed to create user account';
      alert(`Error: ${errorMsg}`);
      console.error('User creation error:', error);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAddWorkHistory = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await addWorkHistory(freelancer._id, workHistoryForm);
      setShowWorkHistoryModal(false);
      setWorkHistoryForm({
        assignment: '',
        startDate: '',
        endDate: '',
        hours: '',
        rate: freelancer.hourlyRate || '',
        notes: ''
      });
      window.location.reload();
    } catch (err) {
      setModalError('Failed to add work history');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-2xl font-bold mb-4 text-[#2EAB2C]">{freelancer.fullName}</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['overview', 'hr', 'compliance', 'work-history', 'assignments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize ${
              activeTab === tab 
                ? 'border-b-2 border-[#2EAB2C] text-[#2EAB2C]' 
                : 'text-gray-600 hover:text-[#2EAB2C]'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
            <h3 className="text-lg font-semibold mb-3 text-[#2EAB2C]">Personal Information</h3>
            <div className="space-y-2">
              <div><span className="font-semibold">Email:</span> {freelancer.email}</div>
              <div><span className="font-semibold">Mobile:</span> {freelancer.mobileNumber}</div>
              <div><span className="font-semibold">Home Address:</span> {freelancer.homeAddress}</div>
              <div><span className="font-semibold">Geographical Location:</span> {freelancer.geographicalLocation}</div>
              <div><span className="font-semibold">Role:</span> {freelancer.role}</div>
              <div><span className="font-semibold">Miles Willing to Travel:</span> {freelancer.milesWillingToTravel}</div>
              <div><span className="font-semibold">On WhatsApp:</span> {freelancer.isOnWhatsApp ? 'Yes' : 'No'}</div>
            </div>
      </div>
      <div>
            <h3 className="text-lg font-semibold mb-3 text-[#2EAB2C]">Professional Information</h3>
            <div className="space-y-2">
              <div><span className="font-semibold">Social Work England Registration:</span> {freelancer.hasSocialWorkEnglandRegistration ? 'Yes' : 'No'}</div>
        {freelancer.hasSocialWorkEnglandRegistration && (
                <div><span className="font-semibold">Registration Number:</span> {freelancer.socialWorkEnglandRegistrationNumber}</div>
        )}
              <div><span className="font-semibold">DBS Check:</span> {freelancer.hasDBSCheck ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold">On Update System:</span> {freelancer.isOnUpdateSystem ? 'Yes' : 'No'}</div>
        {freelancer.dbsCertificateUrl && (
                <div><span className="font-semibold">DBS Certificate:</span> <a href={backendBaseUrl + freelancer.dbsCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">View File</a></div>
        )}
      </div>
    </div>
        </div>
      )}

      {/* HR Tab */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          {/* CRM Login Access Section */}
          {freelancer.status === 'approved' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-900 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5" />
                CRM Portal Access
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                User account status for {freelancer.fullName} to login to the CRM portal
              </p>
              <div className="flex items-center justify-between bg-white rounded p-4">
                <div>
                  <p className="font-semibold text-gray-900">Login Email: {freelancer.email}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    If a user account exists, they can login at <a href="/" className="text-blue-600 underline">CRM Login</a>
                  </p>
                </div>
                <button 
                  onClick={handleCreateUserAccount}
                  disabled={creatingUser}
                  className="px-4 py-2 bg-[#2EAB2C] text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {creatingUser ? 'Creating...' : '🔑 Generate Login'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Click "Generate Login" to create/resend credentials. If account already exists, you'll be notified.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-lg font-semibold mb-3 text-[#2EAB2C]">Rates & Availability</h3>
              <div className="space-y-2">
                <div><span className="font-semibold">Hourly Rate:</span> £{freelancer.hourlyRate || 0}</div>
                <div><span className="font-semibold">Daily Rate:</span> £{freelancer.dailyRate || 0}</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Availability:</span>
                  <span className={`px-2 py-1 rounded text-sm ${availabilityColors[freelancer.availability] || 'bg-gray-100'}`}>
                    {freelancer.availability || 'available'}
                  </span>
                </div>
                {freelancer.availabilityNotes && (
                  <div><span className="font-semibold">Notes:</span> {freelancer.availabilityNotes}</div>
                )}
                <button 
                  onClick={() => setShowAvailabilityModal(true)}
                  className="mt-2 px-3 py-1 bg-[#2EAB2C] text-white rounded text-sm hover:bg-green-800"
                >
                  Update Rates & Availability
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-lg font-semibold mb-3 text-[#2EAB2C]">Contract Information</h3>
              <div className="space-y-2">
                <div><span className="font-semibold">Status:</span> {freelancer.contractStatus || 'active'}</div>
                <div>
                  <span className="font-semibold">Renewal Date:</span> 
                  {freelancer.contractRenewalDate ? (
                    (() => {
                      const renewalDate = new Date(freelancer.contractRenewalDate);
                      const today = new Date();
                      const thirtyDaysFromNow = new Date();
                      thirtyDaysFromNow.setDate(today.getDate() + 30);
                      const sevenDaysFromNow = new Date();
                      sevenDaysFromNow.setDate(today.getDate() + 7);
                      
                      const isExpired = renewalDate < today;
                      const isUrgent = renewalDate >= today && renewalDate <= sevenDaysFromNow;
                      const isExpiringSoon = renewalDate > sevenDaysFromNow && renewalDate <= thirtyDaysFromNow;
                      
                      return (
                        <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                          isExpired ? 'bg-red-100 text-red-800' :
                          isUrgent ? 'bg-red-50 text-red-700 border border-red-300' :
                          isExpiringSoon ? 'bg-yellow-50 text-yellow-700 border border-yellow-300' :
                          ''
                        }`}>
                          {formatDate(freelancer.contractRenewalDate)}
                          {isExpired && ' (EXPIRED)'}
                          {isUrgent && ' (URGENT - Expiring Soon!)'}
                          {isExpiringSoon && ' (Expiring in 30 days)'}
                        </span>
                      );
                    })()
                  ) : (
                    ' Not set'
                  )}
                </div>
                <button 
                  onClick={() => setShowContractModal(true)}
                  className="mt-2 px-3 py-1 bg-[#2EAB2C] text-white rounded text-sm hover:bg-green-800"
                >
                  Update Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#2EAB2C]">Compliance Documents</h3>
            <button 
              onClick={() => setShowComplianceModal(true)}
              className="px-4 py-2 bg-[#2EAB2C] text-white rounded hover:bg-green-800"
            >
              Add Document
            </button>
    </div>
          {freelancer.complianceDocuments && freelancer.complianceDocuments.length > 0 ? (
            <div className="grid gap-4">
              {freelancer.complianceDocuments.map((doc, index) => {
                const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
                const today = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                
                const isExpired = expiryDate && expiryDate < today;
                const isExpiringSoon = expiryDate && !isExpired && expiryDate <= thirtyDaysFromNow;
                
                return (
                  <div key={index} className={`border rounded p-4 ${
                    isExpired ? 'bg-red-50 border-red-300' : 
                    isExpiringSoon ? 'bg-yellow-50 border-yellow-300' : 
                    'bg-white'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">{doc.name}</h4>
                        <p className="text-sm text-gray-600">Type: {getDocumentTypeLabel(doc.type)}</p>
                        {doc.expiryDate && (
                          <p className="text-sm text-gray-600">
                            Expires: {formatDate(doc.expiryDate)}
                            {isExpired && (
                              <span className="ml-2 text-red-600 font-semibold">(EXPIRED)</span>
                            )}
                            {isExpiringSoon && (
                              <span className="ml-2 text-yellow-600 font-semibold">(EXPIRING SOON)</span>
                            )}
                          </p>
                        )}
                        {isExpired && (
                          <p className="text-sm text-red-600 mt-2 font-medium">
                            ⚠️ This document has expired. Please upload a renewed version.
                          </p>
                        )}
                        {isExpiringSoon && (
                          <p className="text-sm text-yellow-700 mt-2 font-medium">
                            ⚠️ This document will expire soon. Consider uploading a renewed version.
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {doc.fileUrl && (
                          <a 
                            href={backendBaseUrl + doc.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View File
                          </a>
                        )}
                        {(isExpired || isExpiringSoon) && (
                          <button
                            onClick={() => {
                              setComplianceForm({
                                name: doc.name,
                                type: doc.type,
                                expiryDate: '',
                                file: null
                              });
                              setShowComplianceModal(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Upload Renewal
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCompliance(index)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">No compliance documents uploaded yet.</p>
          )}
        </div>
      )}

      {/* Work History Tab */}
      {activeTab === 'work-history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#2EAB2C]">Work History</h3>
            <button 
              onClick={() => setShowWorkHistoryModal(true)}
              className="px-4 py-2 bg-[#2EAB2C] text-white rounded hover:bg-green-800"
            >
              Add Entry
            </button>
          </div>
          {freelancer.workHistory && freelancer.workHistory.length > 0 ? (
            <div className="grid gap-4">
              {freelancer.workHistory.map((work, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{work.assignment}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(work.startDate)} - {work.endDate ? formatDate(work.endDate) : 'Ongoing'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {work.hours} hours @ £{work.rate}/hour = £{work.totalAmount}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        work.status === 'completed' ? 'bg-green-100 text-green-800' :
                        work.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {work.status}
                      </span>
                      {work.notes && <p className="text-sm mt-2">{work.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No work history recorded yet.</p>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-[#2EAB2C] rounded-lg p-6 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">How to Assign Jobs to {freelancer.fullName}</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#2EAB2C] text-lg">1.</span>
                    <div>
                      <p className="font-semibold">For Assessment Jobs:</p>
                      <p>Go to <a href="/recruitment" className="text-[#2EAB2C] underline hover:text-green-700">Recruitment Pipeline</a> → Select an Enquiry → Full Assessment Section → Choose this freelancer as the Assessor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#2EAB2C] text-lg">2.</span>
                    <div>
                      <p className="font-semibold">For Training Sessions:</p>
                      <p>Go to <a href="/training" className="text-[#2EAB2C] underline hover:text-green-700">Training Events</a> → Create/Edit Event → Assign Trainer (Note: Requires User account)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-[#2EAB2C] text-lg">3.</span>
                    <div>
                      <p className="font-semibold">For General Work/Projects:</p>
                      <p>Use the "Work History" tab above to manually log assignments and track hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Assign to Assessment</h3>
                  <p className="text-sm text-gray-600">Full Form F or Initial Assessments</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Assign {freelancer.fullName} to evaluate foster carer applications in the recruitment pipeline.
              </p>
              <a 
                href="/recruitment"
                className="block w-full text-center px-4 py-2 bg-[#2EAB2C] text-white rounded-md hover:bg-green-700 font-medium transition-colors"
              >
                Go to Recruitment Pipeline →
              </a>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Assign to Training</h3>
                  <p className="text-sm text-gray-600">Training events and workshops</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Assign {freelancer.fullName} as a trainer for upcoming training events and sessions.
              </p>
              <a 
                href="/training"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
              >
                Go to Training Events →
              </a>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Availability</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    freelancer.availability === 'available' ? 'bg-green-100 text-green-800' :
                    freelancer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {freelancer.availability || 'available'}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                <p className="text-xl font-bold text-gray-900">£{freelancer.hourlyRate || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                <p className="text-xl font-bold text-gray-900">£{freelancer.dailyRate || 0}</p>
              </div>
            </div>
          </div>

          {/* Active Work Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active Work Assignments
            </h3>
            {freelancer.workHistory && freelancer.workHistory.length > 0 ? (
              <div className="space-y-3">
                {freelancer.workHistory
                  .filter(work => work.status === 'in_progress')
                  .slice(0, 5)
                  .map((work, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg border border-yellow-200">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{work.assignment}</p>
                        <p className="text-sm text-gray-600">
                          Started: {formatDate(work.startDate)} • {work.hours} hours logged • £{work.rate}/hour
                        </p>
                        {work.notes && (
                          <p className="text-sm text-gray-500 mt-1">{work.notes}</p>
                        )}
                      </div>
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                        In Progress
                      </span>
                    </div>
                  ))}
                {freelancer.workHistory.filter(work => work.status === 'in_progress').length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 mt-2">No active assignments at the moment</p>
                    <p className="text-sm text-gray-400 mt-1">Use the buttons above to assign {freelancer.fullName} to a job</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 mt-2">No work history recorded yet</p>
                <p className="text-sm text-gray-400 mt-1">Assignments will appear here once work is logged</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6">
      <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Update</button>
      <button onClick={() => onDelete(freelancer)} className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button>
    </div>

      {/* Update Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Rates & Availability</h3>
              {modalError && <div className="text-red-600 text-sm mb-3">{modalError}</div>}
              <form onSubmit={handleUpdateAvailability} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate (£)</label>
                    <input
                      type="number"
                      value={availabilityForm.hourlyRate}
                      onChange={(e) => setAvailabilityForm({...availabilityForm, hourlyRate: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Rate (£)</label>
                    <input
                      type="number"
                      value={availabilityForm.dailyRate}
                      onChange={(e) => setAvailabilityForm({...availabilityForm, dailyRate: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability Status</label>
                  <select
                    value={availabilityForm.availability}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, availability: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={availabilityForm.availabilityNotes}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, availabilityNotes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAvailabilityModal(false);
                      setModalError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Contract Information</h3>
              {modalError && <div className="text-red-600 text-sm mb-3">{modalError}</div>}
              <form onSubmit={handleUpdateContract} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Status</label>
                  <select
                    value={contractForm.contractStatus}
                    onChange={(e) => setContractForm({...contractForm, contractStatus: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="pending_renewal">Pending Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Renewal Date</label>
                  <input
                    type="date"
                    value={contractForm.contractRenewalDate}
                    onChange={(e) => setContractForm({...contractForm, contractRenewalDate: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContractModal(false);
                      setModalError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Compliance Document Modal */}
      {showComplianceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Compliance Document</h3>
              {modalError && <div className="text-red-600 text-sm mb-3">{modalError}</div>}
              <form onSubmit={handleAddCompliance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Name</label>
                  <input
                    type="text"
                    value={complianceForm.name}
                    onChange={(e) => setComplianceForm({...complianceForm, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                    placeholder="e.g., DBS Certificate 2024"
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
                    <option value="dbs">DBS Certificate</option>
                    <option value="qualification">Qualification</option>
                    <option value="insurance">Insurance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
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
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#2EAB2C] file:text-white
                      hover:file:bg-green-700"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowComplianceModal(false);
                      setModalError(null);
                    }}
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

      {/* Add Work History Modal */}
      {showWorkHistoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Work Entry</h3>
              {modalError && <div className="text-red-600 text-sm mb-3">{modalError}</div>}
              <form onSubmit={handleAddWorkHistory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assignment Name</label>
                  <input
                    type="text"
                    value={workHistoryForm.assignment}
                    onChange={(e) => setWorkHistoryForm({...workHistoryForm, assignment: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                    placeholder="e.g., Form F Assessment - Case #123"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={workHistoryForm.startDate}
                      onChange={(e) => setWorkHistoryForm({...workHistoryForm, startDate: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={workHistoryForm.endDate}
                      onChange={(e) => setWorkHistoryForm({...workHistoryForm, endDate: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      value={workHistoryForm.hours}
                      onChange={(e) => setWorkHistoryForm({...workHistoryForm, hours: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      placeholder="e.g., 8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate (£/hr)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={workHistoryForm.rate}
                      onChange={(e) => setWorkHistoryForm({...workHistoryForm, rate: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      placeholder="e.g., 45.00"
                      required
                    />
                  </div>
                </div>
                {workHistoryForm.hours && workHistoryForm.rate && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-[#2EAB2C]">
                        £{(parseFloat(workHistoryForm.hours) * parseFloat(workHistoryForm.rate)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={workHistoryForm.notes}
                    onChange={(e) => setWorkHistoryForm({...workHistoryForm, notes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWorkHistoryModal(false);
                      setModalError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? 'Adding...' : 'Add Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
  </div>
);
};

function formatDateForInput(date) {
  if (!date) return '';
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Try to parse and format
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}

const FreelancerForm = ({ freelancer, onBack, onSave, loading }) => {
  const [approving, setApproving] = useState(false);
  const [form, setForm] = useState({
    _id: freelancer?._id || undefined,
    // Section 1: Personal Information
    fullName: freelancer?.fullName || '',
    homeAddress: freelancer?.homeAddress || '',
    email: freelancer?.email || '',
    mobileNumber: freelancer?.mobileNumber || '',
    isOnWhatsApp: freelancer?.isOnWhatsApp || false,

    // Section 2: Professional Information
    hasSocialWorkEnglandRegistration: freelancer?.hasSocialWorkEnglandRegistration || false,
    socialWorkEnglandRegistrationNumber: freelancer?.socialWorkEnglandRegistrationNumber || '',
    hasDBSCheck: freelancer?.hasDBSCheck || false,
    isOnUpdateSystem: freelancer?.isOnUpdateSystem || false,
    dbsCertificateFile: null,
    dbsCertificateUrl: freelancer?.dbsCertificateUrl || '',

    // Section 3: Location & Availability
    currentLocation: freelancer?.currentLocation || '',
    geographicalLocation: freelancer?.geographicalLocation || '',
    role: freelancer?.role || '',
    milesWillingToTravel: freelancer?.milesWillingToTravel || '',

    // Section 4: Work Experience & Skills
    hasFormFAssessmentExperience: freelancer?.hasFormFAssessmentExperience || false,
    formFAssessmentExperienceYears: freelancer?.formFAssessmentExperienceYears || '',
    otherSocialWorkAssessmentExperience: (() => {
      if (Array.isArray(freelancer?.otherSocialWorkAssessmentExperience)) {
        if (
          freelancer.otherSocialWorkAssessmentExperience.length === 1 &&
          typeof freelancer.otherSocialWorkAssessmentExperience[0] === 'string' &&
          freelancer.otherSocialWorkAssessmentExperience[0].startsWith('[')
        ) {
          return JSON.parse(freelancer.otherSocialWorkAssessmentExperience[0]);
        }
        return freelancer.otherSocialWorkAssessmentExperience;
      }
      if (
        typeof freelancer?.otherSocialWorkAssessmentExperience === 'string' &&
        freelancer.otherSocialWorkAssessmentExperience.startsWith('[')
      ) {
        return JSON.parse(freelancer.otherSocialWorkAssessmentExperience);
      }
      return [];
    })(),

    // Section 5: Consideration for Work & Training
    considerationFor: (() => {
      if (Array.isArray(freelancer?.considerationFor)) {
        if (
          freelancer.considerationFor.length === 1 &&
          typeof freelancer.considerationFor[0] === 'string' &&
          freelancer.considerationFor[0].startsWith('[')
        ) {
          return JSON.parse(freelancer.considerationFor[0]);
        }
        return freelancer.considerationFor;
      }
      if (
        typeof freelancer?.considerationFor === 'string' &&
        freelancer.considerationFor.startsWith('[')
      ) {
        return JSON.parse(freelancer.considerationFor);
      }
      return [];
    })(),
    roles: (() => {
      if (Array.isArray(freelancer?.roles)) {
        return freelancer.roles;
      }
      if (typeof freelancer?.roles === 'string' && freelancer.roles.startsWith('[')) {
        return JSON.parse(freelancer.roles);
      }
      return [];
    })(),

    // Section 6: Additional Information
    qualificationsAndTraining: freelancer?.qualificationsAndTraining || '',
    additionalInfo: freelancer?.additionalInfo || '',
    professionalReferences: freelancer?.professionalReferences || '',
    cvFile: null,
    cvUrl: freelancer?.cvUrl || '',

    // Section 7: Payment & Tax Information
    paymentPreferences: Array.isArray(freelancer?.paymentPreferences)
      ? freelancer.paymentPreferences[0] || ''
      : (freelancer?.paymentPreferences || ''),
    paymentOther: freelancer?.paymentOther || '',
  });

  // Options for select/multiselect fields
  const geoOptions = [
    'North East', 'North West', 'East Midlands', 'West Midlands', 'South East', 'South West', 'London', 'Other', 'Wales', 'Scotland'
  ];
  const roleOptions = [
    'Foster Carer', 'Kinship Carer', 'SGO', 'Interested in Fostering', 'Social Worker', 'Other'
  ];
  const assessmentOptions = [
    'Fostering Panel Work', 'Adoption Assessments', 'Kinship Care Assessments', 'Special Guardianship Order (SGO) Assessments', 'Court Report Writing', 'Child Protection & Safeguarding', 'Standard of Care investigation'
  ];
  const considerationOptions = [
    'Form F Assessments', 'Other Social Work Assessments', 'Delivery Training', 'Initial Home Visit'
  ];
  const paymentOptions = [
    'Through an umbrella company - we can refer', 'Self-employed (invoice directly)', 'Limited company (invoice through my company)', 'Other:'
  ];

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleArrayCheckboxChange(name, option) {
    setForm(f => {
      const arr = f[name] || [];
      if (arr.includes(option)) {
        return { ...f, [name]: arr.filter(o => o !== option) };
      } else {
        return { ...f, [name]: [...arr, option] };
      }
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form); // Send the full form, including file objects
  }

  const handleApprovalStatusChange = async (newStatus) => {
    if (!freelancer?._id) return;
    
    const confirmMessage = newStatus === 'approved' 
      ? 'Are you sure you want to approve this freelancer? This will:\n\n• Change their status to "Approved"\n• Automatically create a User account for them\n• Send them login credentials via email\n\nProceed?'
      : 'Are you sure you want to reject this freelancer application?';
      
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      // Update status first
      await updateFreelancerStatus(freelancer._id, newStatus);
      
      // If approving, create user account automatically
      if (newStatus === 'approved') {
        try {
          const result = await createUserAccountForFreelancer(freelancer._id);
          alert(`Freelancer approved successfully!\n\nUser account created:\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.password}\n\n(Credentials have been sent to the freelancer's email)`);
        } catch (userError) {
          // If user account creation fails (e.g., already exists), still show success for approval
          console.error('User account creation error:', userError);
          alert('Freelancer approved successfully!\nNote: User account may already exist or email could not be sent.');
        }
      } else {
        alert('Freelancer status updated.');
      }
      
      window.location.reload(); // Reload to show updated status
    } catch (error) {
      alert('Failed to update status. Please try again.');
      console.error(error);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg mt-8">
      <button onClick={onBack} className="mb-6 text-[#2EAB2C] hover:underline font-semibold">&larr; Back</button>
      <h2 className="text-3xl font-extrabold mb-8 text-center text-[#2EAB2C] tracking-tight drop-shadow">{freelancer ? "Edit" : "Add"} Freelancer</h2>
      
      {/* Approval Status Banner - Only show for existing freelancers */}
      {freelancer && (
        <div className={`mb-6 rounded-lg border-l-4 p-4 ${
          freelancer.status === 'pending' 
            ? 'bg-yellow-50 border-yellow-400' 
            : freelancer.status === 'approved'
            ? 'bg-green-50 border-green-400'
            : 'bg-red-50 border-red-400'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {freelancer.status === 'pending' && (
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              )}
              {freelancer.status === 'approved' && (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              )}
              {freelancer.status === 'rejected' && (
                <XCircleIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-semibold ${
                freelancer.status === 'pending' 
                  ? 'text-yellow-800' 
                  : freelancer.status === 'approved'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {freelancer.status === 'pending' && 'Approval Pending'}
                {freelancer.status === 'approved' && 'Approved & Active'}
                {freelancer.status === 'rejected' && 'Application Rejected'}
              </h3>
              <div className={`mt-1 text-sm ${
                freelancer.status === 'pending' 
                  ? 'text-yellow-700' 
                  : freelancer.status === 'approved'
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {freelancer.status === 'pending' && (
                  <p>This freelancer is awaiting approval. Review their information below and approve or reject their application.</p>
                )}
                {freelancer.status === 'approved' && (
                  <p>This freelancer has been approved and is active in the system. They will appear in the "Active Freelancers" dashboard count.</p>
                )}
                {freelancer.status === 'rejected' && (
                  <p>This application was rejected. You can approve them if this was done in error.</p>
                )}
              </div>
              {freelancer.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleApprovalStatusChange('approved')}
                    disabled={approving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {approving ? 'Approving...' : 'Approve Freelancer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprovalStatusChange('rejected')}
                    disabled={approving}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    {approving ? 'Rejecting...' : 'Reject Application'}
                  </button>
                </div>
              )}
              {freelancer.status === 'rejected' && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleApprovalStatusChange('approved')}
                    disabled={approving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    {approving ? 'Approving...' : 'Approve Freelancer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Personal Information</h3>
          <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" required />
          <input name="homeAddress" placeholder="Home Address" value={form.homeAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <input name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Are you on WhatsApp?</span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnWhatsApp"
                value="true"
                checked={form.isOnWhatsApp === true}
                onChange={() => setForm(f => ({ ...f, isOnWhatsApp: true }))}
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnWhatsApp"
                value="false"
                checked={form.isOnWhatsApp === false}
                onChange={() => setForm(f => ({ ...f, isOnWhatsApp: false }))}
                className="accent-green-600"
              />
              No
            </label>
          </div>
        </div>
        {/* Section 2: Professional Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Professional Information</h3>
          {/* Social Work England Registration */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have a Social Work England Registration? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasSocialWorkEnglandRegistration"
                value="false"
                checked={form.hasSocialWorkEnglandRegistration === false}
                onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: false, socialWorkEnglandRegistrationNumber: '' }))}
                required
                className="accent-green-600"
              />
              No
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasSocialWorkEnglandRegistration"
                value="true"
                checked={form.hasSocialWorkEnglandRegistration === true}
                onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
          </div>
          {form.hasSocialWorkEnglandRegistration === true && (
            <input
              name="socialWorkEnglandRegistrationNumber"
              placeholder="Social Work England Registration Number"
              value={form.socialWorkEnglandRegistrationNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mb-2"
              required
            />
          )}
          {/* DBS Check */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have a DBS Check? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasDBSCheck"
                value="true"
                checked={form.hasDBSCheck === true}
                onChange={() => setForm(f => ({ ...f, hasDBSCheck: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasDBSCheck"
                value="false"
                checked={form.hasDBSCheck === false}
                onChange={() => setForm(f => ({ ...f, hasDBSCheck: false, isOnUpdateSystem: false, dbsCertificateFile: null }))}
                required
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {/* Update System */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Are you on the update system?</span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnUpdateSystem"
                value="true"
                checked={form.isOnUpdateSystem === true}
                onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: true }))}
                disabled={form.hasDBSCheck !== true}
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnUpdateSystem"
                value="false"
                checked={form.isOnUpdateSystem === false}
                onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: false, dbsCertificateFile: null }))}
                disabled={form.hasDBSCheck !== true}
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {form.dbsCertificateUrl && (
            <div className="mb-2">
              <a href={form.dbsCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                View current DBS Certificate
              </a>
            </div>
          )}
          {form.hasDBSCheck === true && form.isOnUpdateSystem === true && (
            <div className="mb-2">
              <label className="block mb-1">Upload new DBS Certification (optional)</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-green-100 text-[#2EAB2C] font-semibold rounded-lg shadow cursor-pointer hover:bg-green-200 transition border border-green-300">
                  <PaperClipIcon className="w-5 h-5 mr-2" />
                  {form.dbsCertificateFile ? 'Change file' : 'Choose file'}
                  <input
                    type="file"
                    name="dbsCertificateFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="hidden accent-green-600"
                  />
                </label>
                {form.dbsCertificateFile && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">{form.dbsCertificateFile.name}</span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Section 3: Location & Availability */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Location & Availability</h3>
          <input name="currentLocation" placeholder="Current Location (City & County)" value={form.currentLocation} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          {/* Geographical Location */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Geographical Location</span>
            <div className="flex flex-col gap-1">
              {geoOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="radio"
                    name="geographicalLocation"
                    value={opt}
                    checked={form.geographicalLocation === opt}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {/* Role */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Role</span>
            <div className="flex flex-col gap-1">
              {roleOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="radio"
                    name="role"
                    value={opt}
                    checked={form.role === opt}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {/* Miles Willing to Travel for Training */}
          <label className="block mb-1">Miles Willing to Travel for Training <span className="text-red-600 font-bold">*</span></label>
          <select
            name="milesWillingToTravel"
            value={form.milesWillingToTravel}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded mb-2"
            required
          >
            <option value="" disabled>Select...</option>
            <option value="upto 10 miles">upto 10 miles</option>
            <option value="10-20 miles">10-20 miles</option>
            <option value="20-50 miles">20-50 miles</option>
            <option value="50+ miles">50+ miles</option>
            <option value="nationwide">nationwide</option>
          </select>
        </div>
        {/* Section 4: Work Experience & Skills */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Work Experience & Skills</h3>
          {/* Form F Assessments Experience */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have experience in Form F Assessments? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasFormFAssessmentExperience"
                value="true"
                checked={form.hasFormFAssessmentExperience === true}
                onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasFormFAssessmentExperience"
                value="false"
                checked={form.hasFormFAssessmentExperience === false}
                onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: false, formFAssessmentExperienceYears: '' }))}
                required
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {form.hasFormFAssessmentExperience === true && (
            <div className="mb-2">
              <label className="block mb-1">If yes, how many years of experience? <span className="text-red-600 font-bold">*</span></label>
              <select
                name="formFAssessmentExperienceYears"
                value={form.formFAssessmentExperienceYears}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mb-2"
                required
              >
                <option value="" disabled>Select...</option>
                <option value="0-1 years">0-1 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="6-10 years">6-10 years</option>
              </select>
            </div>
          )}
          {/* Other Social Work Assessment Experience */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Other Social Work Assessment Experience</span>
            <div className="flex flex-col gap-1">
              {assessmentOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={form.otherSocialWorkAssessmentExperience.includes(opt)}
                    onChange={() => handleArrayCheckboxChange('otherSocialWorkAssessmentExperience', opt)}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Section 5: Consideration for Work & Training */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Consideration for Work & Training</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="block mb-2 font-bold text-base mt-4">What do you want to be considered for?
            </span>
            <div className="flex flex-col gap-1">
              {considerationOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={form.considerationFor.includes(opt)}
                    onChange={() => handleArrayCheckboxChange('considerationFor', opt)}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Roles Assignment (for assignment in system) */}
          <div className="flex flex-wrap gap-2 mb-2 mt-6 pt-6 border-t border-gray-200">
            <span className="block mb-2 font-bold text-base">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">ADMIN ONLY</span>
              Assign System Roles <span className="text-sm font-normal text-gray-600">(determines what jobs they can be assigned to)</span>
            </span>
            <div className="flex flex-col gap-1 w-full">
              <label className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.roles.includes('assessor')}
                  onChange={() => handleArrayCheckboxChange('roles', 'assessor')}
                  className="accent-green-600"
                />
                <strong>Assessor</strong> - Can be assigned to Full Form F Assessments
              </label>
              <label className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.roles.includes('trainer')}
                  onChange={() => handleArrayCheckboxChange('roles', 'trainer')}
                  className="accent-green-600"
                />
                <strong>Trainer</strong> - Can be assigned to Training Events
              </label>
              <label className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={form.roles.includes('mentor')}
                  onChange={() => handleArrayCheckboxChange('roles', 'mentor')}
                  className="accent-green-600"
                />
                <strong>Mentor</strong> - Can be assigned to Mentoring sessions
              </label>
            </div>
          </div>
        </div>
        {/* Section 6: Additional Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Additional Information</h3>
          <textarea name="qualificationsAndTraining" placeholder="Relevant Qualifications & Training" value={form.qualificationsAndTraining} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <textarea name="additionalInfo" placeholder="Any other information you’d like to share?" value={form.additionalInfo} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <textarea name="professionalReferences" placeholder="Professional References (Name, Contact, Relationship)" value={form.professionalReferences} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          {form.cvUrl && (
            <div className="mb-2">
              <a href={form.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                View current CV
              </a>
            </div>
          )}
          <div className="mb-2">
            <label className="block mb-1">Upload new CV (optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-green-100 text-[#2EAB2C] font-semibold rounded-lg shadow cursor-pointer hover:bg-green-200 transition border border-green-300">
                <PaperClipIcon className="w-5 h-5 mr-2" />
                {form.cvFile ? 'Change file' : 'Choose file'}
                <input
                  type="file"
                  name="cvFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                  className="hidden accent-green-600"
                />
              </label>
              {form.cvFile && (
                <span className="text-sm text-gray-700 truncate max-w-xs">{form.cvFile.name}</span>
              )}
            </div>
          </div>
        </div>
        {/* Section 7: Payment & Tax Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Payment & Tax Information</h3>
          <div className="flex flex-col gap-2 mb-2">
            {paymentOptions.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentPreferences"
                  value={opt}
                  checked={form.paymentPreferences === opt}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                {opt}
              </label>
            ))}
          </div>
          {form.paymentPreferences === 'Other:' && (
            <input name="paymentOther" placeholder="Other payment preference" value={form.paymentOther} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#2EAB2C] to-green-600 text-white py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 font-extrabold text-lg tracking-wide transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : (freelancer ? "Save" : "Add")}
        </button>
      </form>
    </div>
  );
};

const Freelancers = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isFreelancer = user?.role === 'freelancer';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const backendBaseUrl = "https://crm-backend-0v14.onrender.com";

  // --- Send Form Online modal state ---
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [sendFormEmail, setSendFormEmail] = useState("");
  const [sendFormStatus, setSendFormStatus] = useState("");
  const [sendFormLoading, setSendFormLoading] = useState(false);

  const handleSendForm = async (e) => {
    e.preventDefault();
    setSendFormLoading(true);
    setSendFormStatus("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/freelancers/send-form-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sendFormEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendFormStatus('Form link sent successfully!');
        setSendFormEmail("");
      } else {
        setSendFormStatus(data.message || 'Failed to send form link.');
      }
    } catch (err) {
      setSendFormStatus('Error sending form link.');
    }
    setSendFormLoading(false);
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  async function fetchFreelancers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getFreelancers();
      // Parse assignments and uploads if needed
      const parsed = data.map(f => ({
        ...f,
        assignments: typeof f.assignments === 'string' ? JSON.parse(f.assignments) : (f.assignments || []),
        uploads: typeof f.uploads === 'string' ? JSON.parse(f.uploads) : (f.uploads || []),
        otherSocialWorkAssessmentExperience: typeof f.otherSocialWorkAssessmentExperience === 'string'
          ? JSON.parse(f.otherSocialWorkAssessmentExperience)
          : (f.otherSocialWorkAssessmentExperience || []),
        considerationFor: typeof f.considerationFor === 'string'
          ? JSON.parse(f.considerationFor)
          : (f.considerationFor || []),
        paymentPreferences: typeof f.paymentPreferences === 'string' && f.paymentPreferences.startsWith('[')
          ? JSON.parse(f.paymentPreferences)
          : f.paymentPreferences,
      }));
      setFreelancers(parsed);
    } catch (err) {
      setError('Failed to load freelancers');
    }
    setLoading(false);
  }

  async function handleSaveFreelancer(freelancer) {
    setSaving(true);
    setError(null);
    console.log(freelancer);
    try {
      if (freelancer._id) {
        await updateFreelancer(freelancer._id, freelancer);
      } else {
        await createFreelancer(freelancer);
      }
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to save freelancer');
    }
    setSaving(false);
  }

  async function handleDeleteFreelancer(freelancer) {
    if (!window.confirm(`Delete freelancer '${freelancer.fullName}'?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteFreelancer(freelancer._id);
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to delete freelancer');
    }
    setSaving(false);
  }

  if (view === "detail" && selected) return <FreelancerDetail freelancer={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} onDelete={handleDeleteFreelancer} backendBaseUrl={backendBaseUrl} />;
  if (view === "edit" && selected) return <FreelancerForm freelancer={selected} onBack={() => setView("detail")} onSave={handleSaveFreelancer} loading={saving} />;
  if (view === "add") return <FreelancerForm onBack={() => setView("list")} onSave={handleSaveFreelancer} loading={saving} />;
  return (
    <>
      {/* Breadcrumb Navigation */}
      <div className="max-w-5xl mx-auto p-4 pt-6">
        <button
          onClick={() => window.location.href = '/hr-module'}
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#2EAB2C] transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to HR Module
        </button>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="hover:text-[#2EAB2C] cursor-pointer" onClick={() => window.location.href = '/hr-module'}>HR Module</span>
          <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-900 font-medium">Freelancer Management</span>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600 max-w-5xl mx-auto px-4">{error}</div>}
      
      {/* --- Send Form Online Button --- */}
      <div className="max-w-5xl mx-auto p-4 flex justify-end">
        <button
          onClick={() => setShowSendFormModal(true)}
          className="bg-black text-white px-4 py-2 rounded shadow hover:bg-gray-600 transition"
        >
          Send Form Online
        </button>
      </div>
      {/* --- Modal --- */}
      {showSendFormModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-2">Send Freelancer Form</h2>
            <form onSubmit={handleSendForm}>
              <input
                type="email"
                placeholder="Freelancer Email"
                value={sendFormEmail}
                onChange={e => setSendFormEmail(e.target.value)}
                required
                className="border p-2 mb-2 w-full rounded"
              />
              <div className="flex gap-2 mb-2">
                <button type="submit" disabled={sendFormLoading} className="bg-black text-white px-4 py-2 rounded">
                  {sendFormLoading ? 'Sending...' : 'Send'}
                </button>
                <button type="button" onClick={() => { setShowSendFormModal(false); setSendFormStatus(""); setSendFormEmail(""); }} className="bg-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </form>
            {sendFormStatus && <div className="mt-2 text-green-600">{sendFormStatus}</div>}
          </div>
        </div>
      )}
      <FreelancerList onSelect={f => { setSelected(f); setView("detail"); }} onAdd={() => setView("add")} freelancers={freelancers} onDelete={handleDeleteFreelancer} />
      {loading && <Loader />}
    </>
  );
};

export default Freelancers;
