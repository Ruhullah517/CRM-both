import React, { useEffect, useState } from 'react';
import {
  getCasesStatus,
  getCaseTypeDistribution,
  getCaseloadByWorker,
  getFreelancerWorkReport,
  getContractStatusReport,
  getRecruitmentPipelineReport,
  getInvoiceRevenueReport,
  getTrainingEventsReport,
  getMentorReport
} from '../services/reports';
import { exportTrainingEvents, exportTrainingBookings, exportPaymentHistory } from '../services/exports';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyPoundIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Existing data
  const [casesStatus, setCasesStatus] = useState({ opened: [], closed: [] });
  const [caseTypes, setCaseTypes] = useState([]);
  const [caseload, setCaseload] = useState([]);
  
  // New data
  const [freelancerWork, setFreelancerWork] = useState([]);
  const [contractStatus, setContractStatus] = useState(null);
  const [recruitmentPipeline, setRecruitmentPipeline] = useState(null);
  const [invoiceRevenue, setInvoiceRevenue] = useState(null);
  const [trainingEvents, setTrainingEvents] = useState(null);
  const [mentorReport, setMentorReport] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
      setLoading(true);
      try {
      console.log('Loading reports data...');
      const [
        casesData,
        typesData,
        caseloadData,
        freelancerData,
        contractData,
        recruitmentData,
        invoiceData,
        trainingData,
        mentorData
      ] = await Promise.all([
        getCasesStatus().catch((err) => {
          console.error('Error loading cases status:', err);
          return { opened: [], closed: [] };
        }),
        getCaseTypeDistribution().catch((err) => {
          console.error('Error loading case types:', err);
          return [];
        }),
        getCaseloadByWorker().catch((err) => {
          console.error('Error loading caseload:', err);
          return [];
        }),
        getFreelancerWorkReport().catch((err) => {
          console.error('Error loading freelancer work:', err);
          return [];
        }),
        getContractStatusReport().catch((err) => {
          console.error('Error loading contract status:', err);
          return null;
        }),
        getRecruitmentPipelineReport().catch((err) => {
          console.error('Error loading recruitment pipeline:', err);
          return null;
        }),
        getInvoiceRevenueReport().catch((err) => {
          console.error('Error loading invoice revenue:', err);
          return null;
        }),
        getTrainingEventsReport().catch((err) => {
          console.error('Error loading training events:', err);
          return null;
        }),
        getMentorReport().catch((err) => {
          console.error('Error loading mentor report:', err);
          return null;
        })
      ]);
      
      console.log('Reports data loaded:', {
        casesData,
        typesData,
        caseloadData,
        freelancerData,
        contractData,
        recruitmentData,
        invoiceData,
        trainingData
      });
      
      setCasesStatus(casesData);
      setCaseTypes(typesData);
      setCaseload(caseloadData);
      setFreelancerWork(freelancerData);
      setContractStatus(contractData);
      setRecruitmentPipeline(recruitmentData);
      setInvoiceRevenue(invoiceData);
      setTrainingEvents(trainingData);
      setMentorReport(mentorData);
    } catch (error) {
      console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'freelancers', name: 'Freelancers', icon: UserGroupIcon },
    { id: 'contracts', name: 'Contracts', icon: DocumentTextIcon },
    { id: 'recruitment', name: 'Recruitment', icon: UserGroupIcon },
    { id: 'financial', name: 'Financial', icon: CurrencyPoundIcon },
    { id: 'training', name: 'Training', icon: AcademicCapIcon },
    { id: 'mentors', name: 'Mentors', icon: AcademicCapIcon },
    { id: 'cases', name: 'Cases', icon: DocumentTextIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="mt-1 text-sm text-gray-600">Comprehensive system analytics and insights</p>
          </div>
          <div className="flex gap-2">
            {/* <button onClick={exportTrainingEvents} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 flex items-center gap-1">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Training Events
            </button> */}
            {/* <button onClick={() => exportTrainingBookings()} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 flex items-center gap-1">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Bookings
            </button> */}
            {/* <button onClick={exportPaymentHistory} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 flex items-center gap-1">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Payments
            </button> */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-[#2EAB2C] text-[#2EAB2C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Freelancers</p>
                      <p className="text-3xl font-bold text-blue-900">{freelancerWork.length}</p>
                    </div>
                    <UserGroupIcon className="w-12 h-12 text-blue-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Contracts</p>
                      <p className="text-3xl font-bold text-green-900">{contractStatus?.statusBreakdown?.active || 0}</p>
                    </div>
                    <DocumentTextIcon className="w-12 h-12 text-green-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">In Pipeline</p>
                      <p className="text-3xl font-bold text-purple-900">{recruitmentPipeline?.pipelineStats?.total || 0}</p>
                    </div>
                    <UserGroupIcon className="w-12 h-12 text-purple-400" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Revenue (Paid)</p>
                      <p className="text-3xl font-bold text-yellow-900">£{invoiceRevenue?.revenueStats?.totalPaid?.toLocaleString() || 0}</p>
                    </div>
                    <CurrencyPoundIcon className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
      </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recruitment Pipeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recruitment Pipeline</h3>
                  {recruitmentPipeline && (
                    <div className="space-y-3">
                      {Object.entries(recruitmentPipeline.pipelineStats).filter(([key]) => key !== 'total').map(([stage, count]) => (
                        <div key={stage} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{stage}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#2EAB2C] h-2 rounded-full" 
                                style={{ width: `${(count / recruitmentPipeline.pipelineStats.total * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contract Status */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Contract Status</h3>
                  {contractStatus && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="text-sm font-semibold text-green-600">{contractStatus.statusBreakdown.active}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expiring Soon (≤30 days)</span>
                        <span className="text-sm font-semibold text-yellow-600">{contractStatus.statusBreakdown.expiringSoon}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expired</span>
                        <span className="text-sm font-semibold text-red-600">{contractStatus.statusBreakdown.expired}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Draft</span>
                        <span className="text-sm font-semibold text-gray-600">{contractStatus.statusBreakdown.draft}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Freelancers Tab */}
          {activeTab === 'freelancers' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Freelancer Work & Earnings</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600">Total Hours Worked</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {freelancerWork.reduce((sum, f) => sum + f.totalHours, 0).toFixed(1)}h
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-900">
                    £{freelancerWork.reduce((sum, f) => sum + f.totalEarnings, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600">Active Freelancers</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {freelancerWork.filter(f => f.inProgressAssignments > 0).length}
                  </p>
                </div>
              </div>

              {/* Freelancer Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earnings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {freelancerWork.map((freelancer) => (
                      <tr key={freelancer.freelancerId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{freelancer.name}</div>
                          <div className="text-xs text-gray-500">{freelancer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {(freelancer.roles || []).map(role => (
                              <span key={role} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            freelancer.availability === 'available' ? 'bg-green-100 text-green-800' :
                            freelancer.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {freelancer.availability}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {freelancer.totalHours.toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          £{freelancer.totalEarnings.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {freelancer.completedAssignments} completed / {freelancer.inProgressAssignments} active
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && contractStatus && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Contract Status & Renewals</h3>
              
              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                  <p className="text-3xl font-bold text-green-900">{contractStatus.statusBreakdown.active}</p>
                  <p className="text-sm text-green-600 mt-1">Active</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
                  <p className="text-3xl font-bold text-yellow-900">{contractStatus.statusBreakdown.expiringSoon}</p>
                  <p className="text-sm text-yellow-600 mt-1">Expiring Soon</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
                  <p className="text-3xl font-bold text-red-900">{contractStatus.statusBreakdown.expired}</p>
                  <p className="text-sm text-red-600 mt-1">Expired</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-3xl font-bold text-gray-900">{contractStatus.statusBreakdown.draft}</p>
                  <p className="text-sm text-gray-600 mt-1">Draft</p>
                </div>
              </div>

              {/* Expiring Contracts Table */}
              {contractStatus.expiringContracts.length > 0 && (
          <div>
                  <h4 className="text-md font-semibold mb-3 text-red-600">⚠️ Contracts Expiring Soon</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Remaining</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contractStatus.expiringContracts.map((contract) => (
                          <tr key={contract.contractId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {contract.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {contract.clientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(contract.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                contract.daysRemaining <= 7 ? 'bg-red-100 text-red-800' :
                                contract.daysRemaining <= 14 ? 'bg-orange-100 text-orange-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contract.daysRemaining} days
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recruitment Tab */}
          {activeTab === 'recruitment' && recruitmentPipeline && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Recruitment Pipeline Analytics</h3>
              
              {/* Pipeline Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(recruitmentPipeline.pipelineStats).filter(([key]) => key !== 'total').map(([stage, count]) => (
                  <div key={stage} className="bg-white border-2 border-gray-200 p-4 rounded-lg text-center hover:border-[#2EAB2C] transition-colors">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 mt-1">{stage}</p>
                </div>
              ))}
            </div>

              {/* Conversion Rates */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
                <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                  Conversion Rates
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Enquiry → Application</p>
                    <p className="text-3xl font-bold text-green-600">{recruitmentPipeline.conversionRates.enquiryToApplication}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Application → Assessment</p>
                    <p className="text-3xl font-bold text-blue-600">{recruitmentPipeline.conversionRates.applicationToAssessment}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Assessment → Approval</p>
                    <p className="text-3xl font-bold text-purple-600">{recruitmentPipeline.conversionRates.assessmentToApproval}%</p>
          </div>
          <div>
                    <p className="text-sm text-gray-600">Overall Conversion</p>
                    <p className="text-3xl font-bold text-[#2EAB2C]">{recruitmentPipeline.conversionRates.overallConversion}%</p>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h4 className="text-md font-semibold mb-3">Status Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(recruitmentPipeline.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600">{status}</p>
                </div>
              ))}
            </div>
          </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && invoiceRevenue && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Financial Overview</h3>
              
              {/* Revenue Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-900">£{invoiceRevenue.revenueStats.totalPaid.toLocaleString()}</p>
                  <p className="text-xs text-green-700 mt-1">{invoiceRevenue.revenueStats.paidCount} invoices</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">£{invoiceRevenue.revenueStats.totalPending.toLocaleString()}</p>
                  <p className="text-xs text-yellow-700 mt-1">{invoiceRevenue.revenueStats.pendingCount} invoices</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-900">£{invoiceRevenue.revenueStats.totalOverdue.toLocaleString()}</p>
                  <p className="text-xs text-red-700 mt-1">{invoiceRevenue.revenueStats.overdueCount} invoices</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600">Total Invoiced</p>
                  <p className="text-2xl font-bold text-blue-900">£{invoiceRevenue.revenueStats.totalInvoiced.toLocaleString()}</p>
                  <p className="text-xs text-blue-700 mt-1">{invoiceRevenue.revenueStats.invoiceCount} invoices</p>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div>
                <h4 className="text-md font-semibold mb-3">Monthly Revenue (Last 6 Months)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invoiced</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Count</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceRevenue.monthlyRevenue.map((month) => (
                        <tr key={month.month} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(month.month + '-01').toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            £{month.invoiced.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            £{month.paid.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {month.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && trainingEvents && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Training Events Analytics</h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-blue-900">{trainingEvents.stats.totalEvents}</p>
                  <p className="text-sm text-blue-600">Total Events</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <p className="text-2xl font-bold text-green-900">{trainingEvents.stats.upcomingEvents}</p>
                  <p className="text-sm text-green-600">Upcoming</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <p className="text-2xl font-bold text-purple-900">{trainingEvents.stats.completedEvents}</p>
                  <p className="text-sm text-purple-600">Completed</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-gray-900">{trainingEvents.stats.draftEvents}</p>
                  <p className="text-sm text-gray-600">Draft</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                  <p className="text-2xl font-bold text-red-900">{trainingEvents.stats.cancelledEvents}</p>
                  <p className="text-sm text-red-600">Cancelled</p>
        </div>
      </div>

              {/* Upcoming Events */}
              {trainingEvents.upcomingEvents.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-600" />
                    Upcoming Training Events
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trainingEvents.upcomingEvents.map((event) => (
                      <div key={event.eventId} className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-[#2EAB2C] transition-colors">
                        <h5 className="font-semibold text-gray-900 mb-2">{event.title}</h5>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>📅 {new Date(event.startDate).toLocaleDateString()}</p>
                          <p>📍 {event.location || 'Virtual'}</p>
                          <p>👤 Trainer: {event.trainer}</p>
                          <p>👥 Max: {event.maxParticipants} participants</p>
                          {event.price > 0 && <p>💷 £{event.price}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mentors Tab */}
          {activeTab === 'mentors' && mentorReport && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Mentor Analytics</h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <p className="text-2xl font-bold text-blue-900">{mentorReport.stats.totalMentors}</p>
                  <p className="text-sm text-blue-600">Total Mentors</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <p className="text-2xl font-bold text-green-900">{mentorReport.stats.activeMentors}</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                  <p className="text-2xl font-bold text-purple-900">{mentorReport.stats.totalAssignments}</p>
                  <p className="text-sm text-purple-600">Total Assignments</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <p className="text-2xl font-bold text-yellow-900">{mentorReport.stats.completedAssignments}</p>
                  <p className="text-sm text-yellow-600">Completed</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-2xl font-bold text-gray-900">{mentorReport.stats.activeAssignments}</p>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                </div>
                {/* <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center">
                  <p className="text-2xl font-bold text-indigo-900">{mentorReport.stats.totalActivityLogs}</p>
                  <p className="text-sm text-indigo-600">Activity Logs</p>
                </div> */}
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 text-center">
                  <p className="text-2xl font-bold text-pink-900">{mentorReport.stats.totalAssignedEnquiries}</p>
                  <p className="text-sm text-pink-600">Assigned Enquiries</p>
                </div>
              </div>

              {/* Mentors Table */}
              <div>
                <h4 className="text-md font-semibold mb-3">Mentor Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Assignments</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity Logs</th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enquiries</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mentorReport.mentors.map((mentor) => (
                        <tr key={mentor.mentorId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                            <div className="text-xs text-gray-500">{mentor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              mentor.status === 'Active' ? 'bg-green-100 text-green-800' :
                              mentor.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {mentor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mentor.totalAssignments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {mentor.activeAssignments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {mentor.completedAssignments}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {mentor.totalActivityLogs}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {mentor.assignedEnquiries}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Case Analytics</h3>

      {/* Case Type Distribution */}
              <div>
                <h4 className="text-md font-semibold mb-3">Case Type Distribution</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {caseTypes.map((type) => (
                    <div key={type.caseType} className="bg-white border border-gray-200 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{type.count}</p>
                      <p className="text-sm text-gray-600">{type.caseType}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Caseload by Worker */}
              <div>
                <h4 className="text-md font-semibold mb-3">Caseload by Worker</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cases</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {caseload.map((worker) => (
                        <tr key={`${worker.userId}-${worker.isLead}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                            <div className="text-xs text-gray-500">{worker.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              worker.isLead ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {worker.isLead ? 'Lead' : 'Support'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {worker.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cases Opened/Closed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold mb-3">Recently Opened</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {casesStatus.opened.slice(0, 10).map((item) => (
                      <div key={`o-${item.date}`} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{item.date}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-3">Recently Closed</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {casesStatus.closed.slice(0, 10).map((item) => (
                      <div key={`c-${item.date}`} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{item.date}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.count}</span>
            </div>
          ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
