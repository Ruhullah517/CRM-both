import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  HomeIcon,
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getEnquiries } from '../services/enquiries';
import { getMentorApplications, getFreelancerApplications } from '../services/recruitment';

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState('initial-assessment');
  const [enquiries, setEnquiries] = useState([]);
  const [mentorApplications, setMentorApplications] = useState([]);
  const [freelancerApplications, setFreelancerApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    type: 'telephone',
    date: '',
    notes: '',
    attendees: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enquiriesData, mentorsData, freelancersData] = await Promise.all([
        getEnquiries(),
        getMentorApplications(),
        getFreelancerApplications()
      ]);
      
      setEnquiries(enquiriesData);
      setMentorApplications(mentorsData);
      setFreelancerApplications(freelancersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: Implement meeting creation
      console.log('Meeting submitted:', meetingForm);
      setShowMeetingModal(false);
      setMeetingForm({ type: 'telephone', date: '', notes: '', attendees: '' });
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'enquiry': 'bg-blue-100 text-blue-800',
      'initial-assessment': 'bg-yellow-100 text-yellow-800',
      'application': 'bg-purple-100 text-purple-800',
      'form-f-assessment': 'bg-green-100 text-green-800',
      'mentoring': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'under-review': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'initial-assessment', name: 'Initial Assessment', icon: ClipboardDocumentListIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'form-f-tracker', name: 'Form F Assessment Tracker', icon: UserGroupIcon }
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
        <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
        <p className="mt-2 text-gray-600">
          Manage foster carer recruitment process, assessments, and documentation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Initial Assessment Tab */}
          {activeTab === 'initial-assessment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Initial Assessment</h2>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enquiries.map((enquiry) => (
                  <div key={enquiry._id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {enquiry.full_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(enquiry.pipelineStage)}`}>
                        {enquiry.pipelineStage || 'Enquiry'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Email:</strong> {enquiry.email_address}</p>
                      <p><strong>Phone:</strong> {enquiry.telephone}</p>
                      <p><strong>Submitted:</strong> {new Date(enquiry.submission_date).toLocaleDateString()}</p>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setSelectedEnquiry(enquiry)}
                        className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 flex items-center justify-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Document Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mentor Applications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Mentor Applications ({mentorApplications.length})
                  </h3>
                  <div className="space-y-3">
                    {mentorApplications.slice(0, 5).map((application) => (
                      <div key={application._id} className="bg-white rounded-md p-3 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{application.name}</p>
                            <p className="text-sm text-gray-600">{application.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Freelancer Applications */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Freelancer Applications ({freelancerApplications.length})
                  </h3>
                  <div className="space-y-3">
                    {freelancerApplications.slice(0, 5).map((application) => (
                      <div key={application._id} className="bg-white rounded-md p-3 border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{application.name}</p>
                            <p className="text-sm text-gray-600">{application.email}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form F Assessment Tracker Tab */}
          {activeTab === 'form-f-tracker' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Form F Assessment Tracker</h2>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assessor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enquiries
                      .filter(e => e.pipelineStage === 'form-f-assessment' || e.pipelineStage === 'mentoring')
                      .map((enquiry) => (
                      <tr key={enquiry._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enquiry.full_name}
                            </div>
                            <div className="text-sm text-gray-500">{enquiry.email_address}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(enquiry.pipelineStage)}`}>
                            {enquiry.pipelineStage || 'Enquiry'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enquiry.assignedAssessor?.name || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enquiry.fullAssessment?.startDate ? 
                            new Date(enquiry.fullAssessment.startDate).toLocaleDateString() : 
                            'Not started'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: '60%' }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Meeting</h3>
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meeting Type</label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({...meetingForm, type: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="telephone">Telephone</option>
                    <option value="home-visit">Home Visit</option>
                    <option value="video-call">Video Call</option>
                    <option value="office-meeting">Office Meeting</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({...meetingForm, date: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attendees</label>
                  <input
                    type="text"
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm({...meetingForm, attendees: e.target.value})}
                    placeholder="Enter attendee names"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={meetingForm.notes}
                    onChange={(e) => setMeetingForm({...meetingForm, notes: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Meeting"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
