import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserGroupIcon,
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import {
  getFreelancers,
  getExpiringCompliance,
  updateFreelancerAvailability,
  addComplianceDocument,
  addWorkHistory,
  deleteFreelancer,
} from '../services/freelancers';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const HRModule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [freelancers, setFreelancers] = useState([]);
  const [expiringCompliance, setExpiringCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFreelancers: 0,
    activeFreelancers: 0,
    availableFreelancers: 0,
    expiringContracts: 0,
    expiringDocuments: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [freelancersData, complianceData] = await Promise.all([
        getFreelancers(),
        getExpiringCompliance()
      ]);
      
      setFreelancers(freelancersData);
      setExpiringCompliance(complianceData);
      
      // Calculate stats
      const total = freelancersData.length;
      const active = freelancersData.filter(f => f.status === 'approved').length;
      const available = freelancersData.filter(f => f.availability === 'available').length;
      const expiringContracts = freelancersData.filter(f => {
        if (!f.contractRenewalDate) return false;
        const renewalDate = new Date(f.contractRenewalDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return renewalDate <= thirtyDaysFromNow;
      }).length;
      const expiringDocuments = complianceData.length;

      setStats({
        totalFreelancers: total,
        activeFreelancers: active,
        availableFreelancers: available,
        expiringContracts,
        expiringDocuments,
      });
    } catch (err) {
      setError('Failed to load HR data');
      console.error('Error loading HR data:', err);
    }
    setLoading(false);
  };

  const handleUpdateAvailability = async (freelancerId, availability) => {
    try {
      await updateFreelancerAvailability(freelancerId, { availability });
      loadData(); // Refresh data
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  if (loading) return <Loader />;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Freelancers"
          value={stats.totalFreelancers}
          icon={UserGroupIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Freelancers"
          value={stats.activeFreelancers}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Available Now"
          value={stats.availableFreelancers}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringContracts + stats.expiringDocuments}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          subtitle={`${stats.expiringContracts} contracts, ${stats.expiringDocuments} documents`}
        />
      </div>

      {/* Expiring Items Alert */}
      {(stats.expiringContracts > 0 || stats.expiringDocuments > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">
              Items Expiring Soon (Next 30 Days)
            </h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            <p>• {stats.expiringContracts} contracts need renewal</p>
            <p>• {stats.expiringDocuments} compliance documents expiring</p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {freelancers.slice(0, 5).map((freelancer) => (
              <div key={freelancer._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {freelancer.fullName?.charAt(0) || 'F'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{freelancer.fullName}</p>
                    <p className="text-sm text-gray-500">{freelancer.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    freelancer.availability === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : freelancer.availability === 'busy'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {freelancer.availability}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    freelancer.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : freelancer.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {freelancer.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const FreelancersTab = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSendFormModal, setShowSendFormModal] = useState(false);
    const [sendFormEmail, setSendFormEmail] = useState('');
    const [sendFormStatus, setSendFormStatus] = useState('');
    const [sendFormLoading, setSendFormLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewFreelancer, setViewFreelancer] = useState(null);
    const [editFreelancer, setEditFreelancer] = useState(null);

    const handleSendForm = async (e) => {
      e.preventDefault();
      setSendFormLoading(true);
      setSendFormStatus('');
      try {
        const res = await fetch('https://crm-backend-0v14.onrender.com/api/freelancers/send-form-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: sendFormEmail }),
        });
        const data = await res.json();
        if (res.ok) {
          setSendFormStatus('Form link sent successfully!');
          setSendFormEmail('');
        } else {
          setSendFormStatus(data.message || 'Failed to send form link.');
        }
      } catch (err) {
        setSendFormStatus('Error sending form link.');
      }
      setSendFormLoading(false);
    };

    const handleDeleteFreelancer = async (freelancerId) => {
      if (!window.confirm('Are you sure you want to delete this freelancer?')) return;
      try {
        await deleteFreelancer(freelancerId);
        loadData();
      } catch (err) {
        setError('Failed to delete freelancer');
      }
    };

    const filteredFreelancers = freelancers.filter(f =>
      f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search freelancers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full sm:w-64"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSendFormModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              Send Form Online
            </button>
            <button
              onClick={() => window.open('/freelancers', '_self')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2EAB2C] hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Freelancer
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredFreelancers.map((freelancer) => (
              <li key={freelancer._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {freelancer.fullName?.charAt(0) || 'F'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{freelancer.fullName}</div>
                      <div className="text-sm text-gray-500">
                        {freelancer.role} • {freelancer.geographicalLocation}
                      </div>
                      <div className="text-sm text-gray-500">
                        {freelancer.email} • {freelancer.mobileNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        freelancer.availability === 'available' 
                          ? 'bg-green-100 text-green-800'
                          : freelancer.availability === 'busy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {freelancer.availability}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        freelancer.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : freelancer.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {freelancer.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open('/freelancers', '_self')}
                        className="text-[#2EAB2C] hover:text-green-700"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open('/freelancers', '_self')}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFreelancer(freelancer._id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Send Form Online Modal */}
        {showSendFormModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Freelancer Form Online</h3>
                <form onSubmit={handleSendForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Freelancer Email</label>
                    <input
                      type="email"
                      value={sendFormEmail}
                      onChange={(e) => setSendFormEmail(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      required
                      placeholder="freelancer@example.com"
                    />
                  </div>
                  {sendFormStatus && (
                    <div className={`text-sm ${sendFormStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                      {sendFormStatus}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSendFormModal(false);
                        setSendFormStatus('');
                        setSendFormEmail('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendFormLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700 disabled:opacity-50"
                    >
                      {sendFormLoading ? 'Sending...' : 'Send Form Link'}
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

  const ComplianceTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Compliance Tracking</h3>
        <div className="text-sm text-gray-500">
          {expiringCompliance.length} documents expiring in next 30 days
        </div>
      </div>

      {expiringCompliance.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {expiringCompliance.map((item, index) => (
              <li key={index}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.freelancerName}</div>
                      <div className="text-sm text-gray-500">{item.documentName}</div>
                      <div className="text-sm text-gray-500">
                        Expires: {formatDate(item.expiryDate)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expiring Soon
                      </span>
                      <button
                        onClick={() => window.open(`/freelancers?id=${item.freelancerId}`, '_blank')}
                        className="text-[#2EAB2C] hover:text-green-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All up to date</h3>
          <p className="mt-1 text-sm text-gray-500">
            No compliance documents are expiring in the next 30 days.
          </p>
        </div>
      )}
    </div>
  );

  const ContractsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Contract Management</h3>
        <div className="text-sm text-gray-500">
          {stats.expiringContracts} contracts need renewal
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {freelancers
            .filter(f => {
              if (!f.contractRenewalDate) return false;
              const renewalDate = new Date(f.contractRenewalDate);
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              return renewalDate <= thirtyDaysFromNow;
            })
            .map((freelancer) => (
            <li key={freelancer._id}>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{freelancer.fullName}</div>
                    <div className="text-sm text-gray-500">{freelancer.role}</div>
                    <div className="text-sm text-gray-500">
                      Contract expires: {formatDate(freelancer.contractRenewalDate)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Needs Renewal
                    </span>
                    <button
                      onClick={() => window.open(`/freelancers?id=${freelancer._id}`, '_blank')}
                      className="text-[#2EAB2C] hover:text-green-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const WorkTrackingTab = () => {
    const [showAddWorkModal, setShowAddWorkModal] = useState(false);
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [workForm, setWorkForm] = useState({
      assignment: '',
      startDate: '',
      endDate: '',
      hours: '',
      rate: '',
      notes: ''
    });

    const handleAddWork = async (e) => {
      e.preventDefault();
      try {
        await addWorkHistory(selectedFreelancer._id, workForm);
        setShowAddWorkModal(false);
        setWorkForm({
          assignment: '',
          startDate: '',
          endDate: '',
          hours: '',
          rate: '',
          notes: ''
        });
        loadData();
      } catch (err) {
        setError('Failed to add work history');
      }
    };

    // Calculate total hours and earnings for each freelancer
    const freelancersWithWorkStats = freelancers.map(freelancer => {
      const totalHours = freelancer.workHistory?.reduce((sum, work) => sum + (work.hours || 0), 0) || 0;
      const totalEarnings = freelancer.workHistory?.reduce((sum, work) => sum + (work.totalAmount || 0), 0) || 0;
      const activeAssignments = freelancer.workHistory?.filter(work => work.status === 'in_progress').length || 0;
      
      return {
        ...freelancer,
        totalHours,
        totalEarnings,
        activeAssignments
      };
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Work Tracking & Hours</h3>
          <button
            onClick={() => setShowAddWorkModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#2EAB2C] hover:bg-green-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Work Entry
          </button>
        </div>

        {/* Work Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {freelancersWithWorkStats.reduce((sum, f) => sum + f.totalHours, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  £{freelancersWithWorkStats.reduce((sum, f) => sum + f.totalEarnings, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {freelancersWithWorkStats.reduce((sum, f) => sum + f.activeAssignments, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Freelancer Work Summary */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Freelancer Work Summary</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Overview of hours worked and earnings by freelancer
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {freelancersWithWorkStats.map((freelancer) => (
              <li key={freelancer._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {freelancer.fullName?.charAt(0) || 'F'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{freelancer.fullName}</div>
                      <div className="text-sm text-gray-500">{freelancer.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{freelancer.totalHours}h</div>
                      <div className="text-xs text-gray-500">Total Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">£{freelancer.totalEarnings.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{freelancer.activeAssignments}</div>
                      <div className="text-xs text-gray-500">Active Jobs</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFreelancer(freelancer);
                        setShowAddWorkModal(true);
                      }}
                      className="text-[#2EAB2C] hover:text-green-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Add Work Modal */}
        {showAddWorkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add Work Entry {selectedFreelancer && `for ${selectedFreelancer.fullName}`}
                </h3>
                <form onSubmit={handleAddWork} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignment</label>
                    <input
                      type="text"
                      value={workForm.assignment}
                      onChange={(e) => setWorkForm({...workForm, assignment: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={workForm.startDate}
                        onChange={(e) => setWorkForm({...workForm, startDate: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={workForm.endDate}
                        onChange={(e) => setWorkForm({...workForm, endDate: e.target.value})}
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
                        value={workForm.hours}
                        onChange={(e) => setWorkForm({...workForm, hours: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rate (£/hr)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={workForm.rate}
                        onChange={(e) => setWorkForm({...workForm, rate: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={workForm.notes}
                      onChange={(e) => setWorkForm({...workForm, notes: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#2EAB2C] focus:border-[#2EAB2C]"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddWorkModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2EAB2C] hover:bg-green-700"
                    >
                      Add Work Entry
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HR Module</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage freelance staff, track compliance, and monitor contracts
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
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
            { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
            { id: 'freelancers', name: 'Freelancers', icon: UserGroupIcon },
            { id: 'compliance', name: 'Compliance', icon: DocumentCheckIcon },
            { id: 'contracts', name: 'Contracts', icon: CalendarIcon },
            { id: 'work-tracking', name: 'Work Tracking', icon: ClockIcon },
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
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'freelancers' && <FreelancersTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
      {activeTab === 'contracts' && <ContractsTab />}
      {activeTab === 'work-tracking' && <WorkTrackingTab />}
    </div>
  );
};

export default HRModule;
