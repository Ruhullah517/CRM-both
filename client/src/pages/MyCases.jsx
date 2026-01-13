import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCases } from '../services/cases';
import { getEnquiries } from '../services/enquiries';
import { getFreelancerByEmail } from '../services/freelancers';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MyCases = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyData();
  }, []);

  const loadMyData = async () => {
    setLoading(true);
    try {
      const userRole = user.user?.role || user.role;
      const userEmail = user.user?.email || user.email;

      if (userRole === 'freelancer') {
        // Get freelancer ID by email
        let freelancerId = null;
        try {
          const freelancerData = await getFreelancerByEmail(userEmail);
          freelancerId = freelancerData._id;
        } catch (err) {
          console.error('Could not find freelancer profile:', err);
          setError('Freelancer profile not found. Please contact your administrator.');
          setLoading(false);
          return;
        }

        // For freelancers, get cases where they are assigned as assessor
        const [casesData, enquiriesData] = await Promise.all([
          getCases().catch(() => []),
          getEnquiries().catch(() => [])
        ]);

        // Filter cases assigned to this freelancer
        const myCases = casesData.filter(caseItem => 
          caseItem.assignedTo === freelancerId || 
          caseItem.assignedAssessor === freelancerId
        );

        // Filter enquiries assigned to this freelancer
        const myEnquiries = enquiriesData.filter(enquiry => 
          enquiry.assignedAssessor === freelancerId ||
          enquiry.assignedMentor === freelancerId
        );

        setCases(myCases);
        setEnquiries(myEnquiries);
      } else if (userRole === 'mentor') {
        // Get user ID for mentors
        const userId = user.user?.id || user.id;
        
        // For mentors, get cases and enquiries where they are assigned as mentor
        const [casesData, enquiriesData] = await Promise.all([
          getCases().catch(() => []),
          getEnquiries().catch(() => [])
        ]);

        // Filter cases assigned to this mentor
        const myCases = casesData.filter(caseItem => 
          caseItem.assignedTo === userId || 
          caseItem.assignedMentor === userId
        );

        // Filter enquiries assigned to this mentor
        const myEnquiries = enquiriesData.filter(enquiry => 
          enquiry.assignedMentor === userId
        );

        setCases(myCases);
        setEnquiries(myEnquiries);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'closed': 'bg-green-100 text-green-800',
      'pending': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage) => {
    const colors = {
      'enquiry': 'bg-blue-100 text-blue-800',
      'initial-assessment': 'bg-yellow-100 text-yellow-800',
      'application': 'bg-purple-100 text-purple-800',
      'form-f-assessment': 'bg-green-100 text-green-800',
      'mentoring': 'bg-indigo-100 text-indigo-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">My Cases & Assignments</h1>
        <p className="mt-2 text-gray-600">
          View your assigned cases and enquiries
        </p>
      </div>

      {/* Cases Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BriefcaseIcon className="h-5 w-5 mr-2" />
          My Cases ({cases.length})
        </h2>
        
        {cases.length > 0 ? (
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div key={caseItem._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {caseItem.caseReferenceNumber || caseItem._id}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Client: {caseItem.clientFullName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {new Date(caseItem.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </span>
                    <div className="text-xs text-gray-500">
                      {caseItem.priority === 'high' && <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                </div>
                {caseItem.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {caseItem.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BriefcaseIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No cases assigned to you</p>
          </div>
        )}
      </div>

      {/* Enquiries Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          My Enquiries ({enquiries.length})
        </h2>
        
        {enquiries.length > 0 ? (
          <div className="space-y-4">
            {enquiries.map((enquiry) => (
              <div key={enquiry._id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {enquiry.firstName} {enquiry.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Email: {enquiry.email}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted: {new Date(enquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(enquiry.pipelineStage)}`}>
                      {enquiry.pipelineStage || 'Enquiry'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {enquiry.lifecycleStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.lifecycleStatus)}`}>
                          {enquiry.lifecycleStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {enquiry.notes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {enquiry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No enquiries assigned to you</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default MyCases;
