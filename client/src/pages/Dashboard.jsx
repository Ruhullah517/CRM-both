import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getCases } from '../services/cases';
import { getContracts } from '../services/contracts';
import { getFreelancers } from '../services/freelancers';
import { getEnquiries } from '../services/enquiries';
import {
  UserGroupIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import RemindersWidget from '../components/RemindersWidget';
import ComplianceAlertsWidget from '../components/ComplianceAlertsWidget';
import { listInvoices } from '../services/invoices';
import api from '../services/api';

export default function Dashboard() {
  const { userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [upcomingTraining, setUpcomingTraining] = useState([]);
  const [urgentCases, setUrgentCases] = useState([]);
  const [quickStats, setQuickStats] = useState({
    totalCases: 0,
    totalContracts: 0,
    totalFreelancers: 0,
    totalEnquiries: 0
  });

  useEffect(() => {
    async function fetchDashboardData() {
      const user = localStorage.getItem('user');
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all data needed for action items
        const [
          casesData,
          contractsData,
          freelancersData,
          enquiriesData,
          invoicesData,
          trainingData
        ] = await Promise.all([
          getCases().catch(() => []),
          getContracts().catch(() => []),
          getFreelancers().catch(() => []),
          getEnquiries().catch(() => []),
          listInvoices().catch(() => []),
          api.get('/training/events').then(r => r.data).catch(() => [])
        ]);

        // Quick stats (just counts)
        setQuickStats({
          totalCases: casesData.length,
          totalContracts: contractsData.length,
          totalFreelancers: freelancersData.length,
          totalEnquiries: enquiriesData.length
        });

        // Action Items: Overdue Invoices
        const overdue = (invoicesData || []).filter(inv => inv.status === 'overdue');
        setOverdueInvoices(overdue.slice(0, 5));

        // Action Items: Expiring Contracts (within 30 days)
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiring = (contractsData || []).filter(contract => {
          if (!contract.endDate) return false;
          const endDate = new Date(contract.endDate);
          return endDate >= today && endDate <= thirtyDaysFromNow;
        }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        setExpiringContracts(expiring.slice(0, 5));

        // Action Items: Pending Freelancer Approvals
        const pending = (freelancersData || []).filter(f => f.status === 'pending');
        setPendingApprovals(pending.slice(0, 5));

        // Action Items: Upcoming Training Events (next 14 days)
        const fourteenDaysFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
        const upcoming = (trainingData || []).filter(event => {
          if (!event.startDate || event.status === 'cancelled') return false;
          const startDate = new Date(event.startDate);
          return startDate >= today && startDate <= fourteenDaysFromNow;
        }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setUpcomingTraining(upcoming.slice(0, 5));

        // Action Items: Urgent Cases (high priority, open status)
        const urgent = (casesData || []).filter(c => 
          c.priority === 'high' && c.status === 'open'
        );
        setUrgentCases(urgent.slice(0, 5));

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Helper function to calculate days until date
  const daysUntil = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Action Center</h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold text-gray-900">{userInfo?.name}</span> ({userInfo?.role})
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      
      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Cases</p>
              <p className="text-3xl font-bold mt-1">{quickStats.totalCases}</p>
            </div>
            <BriefcaseIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Contracts</p>
              <p className="text-3xl font-bold mt-1">{quickStats.totalContracts}</p>
            </div>
            <DocumentTextIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Freelancers</p>
              <p className="text-3xl font-bold mt-1">{quickStats.totalFreelancers}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-green-200" />
              </div>
              </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Enquiries</p>
              <p className="text-3xl font-bold mt-1">{quickStats.totalEnquiries}</p>
            </div>
            <InboxIcon className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Link to Reports */}
      <Link
        to="/reports"
        className="block bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-xl font-bold mb-1">📊 View Detailed Analytics</h3>
            <p className="text-indigo-100">See comprehensive reports, trends, and insights</p>
          </div>
          <ChartBarIcon className="w-10 h-10 text-white" />
        </div>
      </Link>

      {/* Action Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Overdue Invoices */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Overdue Invoices</h2>
              <p className="text-sm text-gray-500">Requires immediate attention</p>
            </div>
          </div>
          {overdueInvoices.length > 0 ? (
            <ul className="space-y-2">
              {overdueInvoices.map((inv) => (
                <li key={inv._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <div>
                    <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">{inv.client?.name || 'N/A'}</p>
                  </div>
                  <span className="text-red-700 font-bold">£{inv.total?.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">All invoices up to date!</span>
            </div>
          )}
          {overdueInvoices.length > 0 && (
            <Link to="/invoices" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Invoices →
            </Link>
          )}
        </div>

        {/* Expiring Contracts */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Contracts Expiring Soon</h2>
              <p className="text-sm text-gray-500">Within 30 days</p>
            </div>
          </div>
          {expiringContracts.length > 0 ? (
            <ul className="space-y-2">
              {expiringContracts.map((contract) => {
                const days = daysUntil(contract.endDate);
                return (
                  <li key={contract._id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition">
                    <div>
                      <p className="font-semibold text-gray-900">{contract.name}</p>
                      <p className="text-sm text-gray-600">{contract.clientName || 'N/A'}</p>
                  </div>
                    <span className={`text-sm font-bold ${days <= 7 ? 'text-red-600' : 'text-yellow-700'}`}>
                      {days} days
                  </span>
                </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">No contracts expiring soon</span>
          </div>
          )}
          {expiringContracts.length > 0 && (
            <Link to="/contracts" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Contracts →
            </Link>
          )}
                  </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-orange-600" />
                    </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pending Freelancer Approvals</h2>
              <p className="text-sm text-gray-500">Awaiting your decision</p>
            </div>
          </div>
          {pendingApprovals.length > 0 ? (
            <ul className="space-y-2">
              {pendingApprovals.map((freelancer) => (
                <li key={freelancer._id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
                  <div>
                    <p className="font-semibold text-gray-900">{freelancer.fullName}</p>
                    <p className="text-sm text-gray-600">{freelancer.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">All freelancers reviewed!</span>
            </div>
          )}
          {pendingApprovals.length > 0 && (
            <Link to="/hr-module" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              Go to HR Module →
            </Link>
          )}
        </div>

        {/* Upcoming Training */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Training Events</h2>
              <p className="text-sm text-gray-500">Next 14 days</p>
            </div>
          </div>
          {upcomingTraining.length > 0 ? (
            <ul className="space-y-2">
              {upcomingTraining.map((event) => (
                <li key={event._id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                  <div>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.location || 'Online'}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {formatDate(event.startDate)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarDaysIcon className="w-5 h-5" />
              <span className="text-sm font-medium">No training scheduled</span>
            </div>
          )}
          {upcomingTraining.length > 0 && (
            <Link to="/training" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View Training Events →
            </Link>
          )}
        </div>
      </div>

      {/* Additional Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RemindersWidget />
        <ComplianceAlertsWidget />
        
        {/* Urgent Cases */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">High Priority Cases</h2>
              <p className="text-sm text-gray-500">Open & urgent</p>
            </div>
          </div>
          {urgentCases.length > 0 ? (
            <ul className="space-y-2">
              {urgentCases.map((c) => (
                <li key={c._id} className="p-3 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  <p className="font-semibold text-gray-900">{c.caseReferenceNumber || c._id}</p>
                  <p className="text-sm text-gray-600">{c.clientFullName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">No urgent cases</span>
            </div>
          )}
          {urgentCases.length > 0 && (
            <Link to="/cases" className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Cases →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
