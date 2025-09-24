import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnquiries, assignEnquiry } from '../services/enquiries';
import { getUsers } from '../services/users';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnquiries();
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const users = await getUsers();
      setStaffList(users.filter(u => u.role === 'staff' || u.role === 'admin'));
    } catch (err) {
      setStaffList([]);
    }
  }

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const data = await getEnquiries();
      // Add assigned_to_name for each enquiry
      const mapped = data.map(enq => ({
        ...enq,
        assigned_to_name: enq.assigned_to?.name || '',
      }));
      setEnquiries(mapped);
    } catch (err) {
      setError('Failed to fetch enquiries');
    }
    setLoading(false);
  }

  async function handleAssign(id) {
    await assignEnquiry(id, staffId);
    setAssigningId(null);
    setStaffId('');
    fetchEnquiries();
  }

  // Get the current stage based on enquiry data
  const getCurrentStage = (enquiry) => {
    if (enquiry.status === 'Completed' || enquiry.status === 'Approved') return 'Approval';
    if (enquiry.mentorAllocation?.mentorId) return 'Mentoring';
    if (enquiry.fullAssessment?.result) return 'Form F Assessment';
    if (enquiry.initialAssessment?.result) return 'Application';
    return 'Enquiry';
  };

  // Get stage color for display
  const getStageColor = (stage) => {
    const colors = {
      'Enquiry': 'bg-gray-100 text-gray-800',
      'Application': 'bg-yellow-100 text-yellow-800',
      'Form F Assessment': 'bg-blue-100 text-blue-800',
      'Mentoring': 'bg-purple-100 text-purple-800',
      'Approval': 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Foster Carer Recruitment Pipeline</h1>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Flow:</span> Enquiry → Initial Assessment → Application → Form F Assessment → Mentoring → Approval
        </div>
      </div>
      
      {/* Stage Legend */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">Enquiry</span>
        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">Initial Assessment</span>
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">Application</span>
        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">Form F Assessment</span>
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm">Mentoring</span>
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Approval</span>
      </div>

      {/* Table for sm and up */}
      <div className="hidden sm:block">
        {enquiries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No enquiries to show.</div>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Submission Date</th>
                <th className="border px-4 py-2">Current Stage</th>
                <th className="border px-4 py-2">Assigned To</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(enq => {
                const currentStage = getCurrentStage(enq);
                return (
                <tr key={enq._id}>
                    <td className="border px-4 py-2 font-medium">{enq.full_name}</td>
                  <td className="border px-4 py-2">{enq.email_address}</td>
                  <td className="border px-4 py-2">{formatDate(enq.submission_date)}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(currentStage)}`}>
                        {currentStage}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{enq.assigned_to_name || '-'}</td>
                    <td className="border px-4 py-2 space-x-2">
                      <button 
                        className="bg-[#2EAB2C] text-white px-3 py-1 rounded text-sm hover:bg-green-700" 
                        onClick={() => navigate(`/enquiries/${enq._id}`)}
                      >
                        Manage
                      </button>
                      {!enq.assigned_to && (
                        <button 
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" 
                          onClick={() => setAssigningId(enq._id)}
                        >
                          Assign
                        </button>
                    )}
                      {assigningId === enq._id && (
                        <span className="ml-2">
                          <select
                            value={staffId}
                            onChange={e => setStaffId(e.target.value)}
                            className="border px-2 py-1 rounded text-sm"
                          >
                            <option value="">Select Staff Member</option>
                            {staffList.map(staff => (
                              <option key={staff.id || staff._id} value={staff.id || staff._id}>
                                {staff.name}
                              </option>
                            ))}
                          </select>
                          <button className="bg-yellow-700 text-white px-2 py-1 rounded ml-1 text-sm" onClick={() => handleAssign(enq._id)} disabled={!staffId}>Confirm</button>
                          <button className="ml-1 text-sm" onClick={() => setAssigningId(null)}>Cancel</button>
                        </span>
                      )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {enquiries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No enquiries to show.</div>
        ) : (
          enquiries.map(enq => {
            const currentStage = getCurrentStage(enq);
            return (
            <div key={enq._id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#2EAB2C]">{enq.full_name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(currentStage)}`}>
                    {currentStage}
                  </span>
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {enq.email_address}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Submitted:</span> {formatDate(enq.submission_date)}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Assigned To:</span> {enq.assigned_to_name || '-'}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                  <button className="w-full bg-[#2EAB2C] text-white px-3 py-2 rounded" onClick={() => navigate(`/enquiries/${enq._id}`)}>Manage</button>
                  {!enq.assigned_to && (
                    <button className="w-full bg-yellow-500 text-white px-3 py-2 rounded" onClick={() => setAssigningId(enq._id)}>Assign</button>
                )}
                  {assigningId === enq._id && (
                    <div className="flex flex-col gap-1 mt-2">
                      <select
                        value={staffId}
                        onChange={e => setStaffId(e.target.value)}
                        className="border px-2 py-1 rounded"
                      >
                        <option value="">Select Staff Member</option>
                        {staffList.map(staff => (
                          <option key={staff.id || staff._id} value={staff.id || staff._id}>
                            {staff.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button className="bg-yellow-700 text-white px-2 py-1 rounded" onClick={() => handleAssign(enq._id)} disabled={!staffId}>Confirm</button>
                        <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => setAssigningId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
} 