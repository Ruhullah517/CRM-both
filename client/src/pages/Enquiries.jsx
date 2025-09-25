import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnquiries } from '../services/enquiries';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'approved', 'rejected'
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      setError('Failed to fetch enquiries');
    }
    setLoading(false);
  }

  // Get the current stage based on enquiry data
  const getCurrentStage = (enquiry) => {
    if (enquiry.status === 'Approved') return 'Approved';
    if (enquiry.status === 'Assessment Fail') return 'Rejected';
    if (enquiry.status === 'Completed') return 'Approval';
    if (enquiry.mentorAllocation?.mentorId) return 'Mentoring';
    if (enquiry.fullAssessment?.result) return 'Form F Assessment';
    if (enquiry.initialAssessment?.result) return 'Application';
    return 'Enquiry';
  };

  const getEnquiryStatus = (enquiry) => {
    if (enquiry.status === 'Approved') return 'approved';
    if (enquiry.status === 'Assessment Fail') return 'rejected';
    return 'active';
  };

  const filterEnquiries = (enquiries, filter) => {
    switch (filter) {
      case 'active':
        return enquiries.filter(enquiry => getEnquiryStatus(enquiry) === 'active');
      case 'approved':
        return enquiries.filter(enquiry => getEnquiryStatus(enquiry) === 'approved');
      case 'rejected':
        return enquiries.filter(enquiry => getEnquiryStatus(enquiry) === 'rejected');
      default:
        return enquiries;
    }
  };

  // Get stage color for display
  const getStageColor = (stage) => {
    const colors = {
      'Enquiry': 'bg-gray-100 text-gray-800',
      'Initial Assessment': 'bg-yellow-100 text-yellow-800',
      'Application': 'bg-blue-100 text-blue-800',
      'Form F Assessment': 'bg-purple-100 text-purple-800',
      'Mentoring': 'bg-indigo-100 text-indigo-800',
      'Approval': 'bg-green-100 text-green-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const filteredEnquiries = filterEnquiries(enquiries, activeFilter);
  const filterCounts = {
    all: enquiries.length,
    active: filterEnquiries(enquiries, 'active').length,
    approved: filterEnquiries(enquiries, 'approved').length,
    rejected: filterEnquiries(enquiries, 'rejected').length
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foster Carer Enquiries</h1>
            <p className="mt-2 text-gray-600">
              View and manage enquiries from potential foster carers
            </p>
          </div>
          <button
            onClick={() => navigate('/recruitment')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            View Recruitment Pipeline
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Enquiries', count: filterCounts.all },
            { key: 'active', label: 'Active Recruitment', count: filterCounts.active },
            { key: 'approved', label: 'Approved', count: filterCounts.approved },
            { key: 'rejected', label: 'Rejected', count: filterCounts.rejected }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition duration-200 ${
                activeFilter === filter.key
                  ? 'bg-[#2EAB2C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Stage Legend */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Stages</h2>
        <div className="flex flex-wrap gap-2">
          {['Enquiry', 'Initial Assessment', 'Application', 'Form F Assessment', 'Mentoring', 'Approval'].map((stage, index) => (
            <div key={stage} className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(stage)}`}>
                {stage}
              </span>
              {index < 5 && <span className="mx-2 text-gray-400">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Enquiries List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeFilter === 'all' ? 'All Enquiries' : 
             activeFilter === 'active' ? 'Active Recruitment' :
             activeFilter === 'approved' ? 'Approved Enquiries' :
             activeFilter === 'rejected' ? 'Rejected Enquiries' : 'Enquiries'} 
            ({filteredEnquiries.length})
          </h2>
        </div>

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {filteredEnquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No enquiries found for the selected filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnquiries.map((enq) => {
                    const currentStage = getCurrentStage(enq);
                    const enquiryStatus = getEnquiryStatus(enq);
                    return (
                      <tr key={enq._id} className={`hover:bg-gray-50 ${enquiryStatus === 'approved' ? 'bg-green-50' : enquiryStatus === 'rejected' ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {enq.full_name}
                              {enquiryStatus === 'approved' && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  ✅ Approved
                                </span>
                              )}
                              {enquiryStatus === 'rejected' && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  ❌ Rejected
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enq.email_address}</div>
                          <div className="text-sm text-gray-500">{enq.telephone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(currentStage)}`}>
                            {currentStage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enq.assigned_to?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(enq.submission_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/enquiries/${enq._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Manage
                            </button>
                            {enquiryStatus === 'approved' && (
                              <button
                                onClick={() => navigate('/candidates')}
                                className="text-green-600 hover:text-green-900 text-xs"
                              >
                                View as Foster Carer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {filteredEnquiries.map((enq) => {
                const currentStage = getCurrentStage(enq);
                const enquiryStatus = getEnquiryStatus(enq);
                return (
                  <div key={enq._id} className={`p-4 border-b border-gray-200 ${enquiryStatus === 'approved' ? 'bg-green-50' : enquiryStatus === 'rejected' ? 'bg-red-50' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <h3 className="font-semibold text-gray-900">{enq.full_name}</h3>
                        {enquiryStatus === 'approved' && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            ✅ Approved
                          </span>
                        )}
                        {enquiryStatus === 'rejected' && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            ❌ Rejected
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(currentStage)}`}>
                        {currentStage}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Email:</strong> {enq.email_address}</p>
                      <p><strong>Phone:</strong> {enq.telephone}</p>
                      <p><strong>Assigned to:</strong> {enq.assigned_to?.name || 'Unassigned'}</p>
                      <p><strong>Submitted:</strong> {formatDate(enq.submission_date)}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => navigate(`/enquiries/${enq._id}`)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Manage
                      </button>
                      {enquiryStatus === 'approved' && (
                        <button
                          onClick={() => navigate('/candidates')}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                        >
                          View as Foster Carer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}