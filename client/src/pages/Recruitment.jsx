import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getEnquiries } from '../services/enquiries';
import { getAssessmentByEnquiryId } from '../services/assessments';
import { getApplicationByEnquiryId } from '../services/applications';
import { getMentorApplications, getFreelancerApplications, getFullAssessmentByEnquiryId, getMentorAllocationByEnquiryId } from '../services/recruitment';

const Recruitment = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [mentorApplications, setMentorApplications] = useState([]);
  const [freelancerApplications, setFreelancerApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enquiryStages, setEnquiryStages] = useState({}); // Store stage data for each enquiry

  // Define the 6 stages of recruitment
  const stages = [
    { key: 'enquiry', name: 'Enquiry', color: 'bg-gray-100 text-gray-800' },
    { key: 'initial-assessment', name: 'Initial Assessment', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'application', name: 'Application', color: 'bg-blue-100 text-blue-800' },
    { key: 'form-f-assessment', name: 'Form F Assessment', color: 'bg-purple-100 text-purple-800' },
    { key: 'mentoring', name: 'Mentoring', color: 'bg-indigo-100 text-indigo-800' },
    { key: 'approval', name: 'Approval', color: 'bg-green-100 text-green-800' }
  ];

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
      
      // Fetch stage data for each enquiry
      await loadEnquiryStages(enquiriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEnquiryStages = async (enquiriesData) => {
    const stagesData = {};
    
    // Fetch assessment and application data for each enquiry
    for (const enquiry of enquiriesData) {
      try {
        const [assessment, application, fullAssessment, mentorAllocation] = await Promise.all([
          getAssessmentByEnquiryId(enquiry._id).catch(() => null),
          getApplicationByEnquiryId(enquiry._id).catch(() => null),
          getFullAssessmentByEnquiryId(enquiry._id).catch(() => null),
          getMentorAllocationByEnquiryId(enquiry._id).catch(() => null)
        ]);
        
        stagesData[enquiry._id] = {
          assessment,
          application,
          fullAssessment,
          mentorAllocation,
        };
      } catch (error) {
        console.error(`Error loading stage data for enquiry ${enquiry._id}:`, error);
        stagesData[enquiry._id] = {
          assessment: null,
          application: null,
          fullAssessment: null,
          mentorAllocation: null,
        };
      }
    }
    
    setEnquiryStages(stagesData);
  };

  // Get current stage for an enquiry based on actual data
  const getCurrentStage = (enquiry) => {
    // Check if enquiry is completed/approved
    if (enquiry.status === 'Completed' || enquiry.status === 'Approved') return 'approval';
    
    // Get stage data for this enquiry
    const stageData = enquiryStages[enquiry._id];
    if (!stageData) return 'enquiry'; // Default if no stage data loaded yet
    
    // Check stages in order of completion
    // 1. Check if initial assessment is completed
    if (stageData.assessment && stageData.assessment.result) {
      // 2. Check if application is uploaded
      if (stageData.application) {
        // 3. Check if form F assessment is completed
        if (stageData.fullAssessment && stageData.fullAssessment.recommendation) {
          // 4. Check if mentor is allocated
          if (stageData.mentorAllocation && stageData.mentorAllocation.mentorId) {
            return 'mentoring';
          }
          return 'form-f-assessment';
        }
        return 'application';
      }
      return 'initial-assessment';
    }
    
    // Default to enquiry stage
    return 'enquiry';
  };

  // Get enquiries by stage
  const getEnquiriesByStage = (stageKey) => {
    return enquiries.filter(enquiry => getCurrentStage(enquiry) === stageKey);
  };

  // Get stage color
  const getStageColor = (stageKey) => {
    const stage = stages.find(s => s.key === stageKey);
    return stage ? stage.color : 'bg-gray-100 text-gray-800';
  };

  // Refresh stage data for a specific enquiry (called when data changes)
  const refreshEnquiryStage = async (enquiryId) => {
    try {
      const [assessment, application, fullAssessment, mentorAllocation] = await Promise.all([
        getAssessmentByEnquiryId(enquiryId).catch(() => null),
        getApplicationByEnquiryId(enquiryId).catch(() => null),
        getFullAssessmentByEnquiryId(enquiryId).catch(() => null),
        getMentorAllocationByEnquiryId(enquiryId).catch(() => null)
      ]);
      
      setEnquiryStages(prev => ({
        ...prev,
        [enquiryId]: {
          assessment,
          application,
          fullAssessment,
          mentorAllocation,
        }
      }));
    } catch (error) {
      console.error(`Error refreshing stage data for enquiry ${enquiryId}:`, error);
    }
  };

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Foster Carer Recruitment Pipeline</h1>
            <p className="mt-2 text-gray-600">
              Track candidates through the complete recruitment journey: Enquiry → Initial Assessment → Application → Form F Assessment → Mentoring → Approval
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <ArrowRightIcon className="h-4 w-4 mr-2" />
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageEnquiries = getEnquiriesByStage(stage.key);
            return (
              <div key={stage.key} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stage.color} mb-2`}>
                  <span className="text-lg font-bold">{stageEnquiries.length}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{stage.name}</p>
                <p className="text-xs text-gray-500">{stageEnquiries.length} candidates</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stages.map((stage) => {
          const stageEnquiries = getEnquiriesByStage(stage.key);
          return (
            <div key={stage.key} className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${stage.color.replace('text-', 'bg-').replace('100', '500')}`}></span>
                  {stage.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{stageEnquiries.length} candidates</p>
              </div>
              
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {stageEnquiries.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No candidates in this stage</p>
                  </div>
                ) : (
                  stageEnquiries.map((enquiry) => {
                    const stageData = enquiryStages[enquiry._id];
                    const currentStage = getCurrentStage(enquiry);
                    
                    return (
                      <div key={enquiry._id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {enquiry.full_name}
                          </h4>
                          <button
                            onClick={() => navigate(`/enquiries/${enquiry._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>{enquiry.email_address}</p>
                          <p>{enquiry.telephone}</p>
                          <p className="text-gray-500">
                            {new Date(enquiry.submission_date).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Stage Progress Indicators */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Progress:</span>
                            <div className="flex space-x-1">
                              {/* Show completion indicators for each stage */}
                              <div className={`w-2 h-2 rounded-full ${
                                currentStage === 'enquiry' || stageData?.assessment ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Enquiry"></div>
                              <div className={`w-2 h-2 rounded-full ${
                                stageData?.assessment?.result ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Initial Assessment"></div>
                              <div className={`w-2 h-2 rounded-full ${
                                stageData?.application ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Application"></div>
                              <div className={`w-2 h-2 rounded-full ${
                                stageData?.fullAssessment?.recommendation ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Form F Assessment"></div>
                              <div className={`w-2 h-2 rounded-full ${
                                stageData?.mentorAllocation?.mentorId ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Mentoring"></div>
                              <div className={`w-2 h-2 rounded-full ${
                                currentStage === 'approval' ? 'bg-green-400' : 'bg-gray-300'
                              }`} title="Approval"></div>
                            </div>
                          </div>
                        </div>

                        {enquiry.assigned_to && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <strong>Assigned to:</strong> {enquiry.assigned_to.name}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentor Applications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Mentor Applications ({mentorApplications.length})
          </h3>
          <div className="space-y-3">
            {mentorApplications.slice(0, 5).map((application) => (
              <div key={application._id} className="bg-gray-50 rounded-md p-3 border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{application.name}</p>
                    <p className="text-sm text-gray-600">{application.email}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Freelancer Applications ({freelancerApplications.length})
          </h3>
          <div className="space-y-3">
            {freelancerApplications.slice(0, 5).map((application) => (
              <div key={application._id} className="bg-gray-50 rounded-md p-3 border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{application.name}</p>
                    <p className="text-sm text-gray-600">{application.email}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
