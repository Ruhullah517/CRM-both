import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import {
  getMentorAssignments,
  completeAssignment,
  getAssignmentDetail,
  addAssignmentLog
} from '../services/mentors';
import { completeMentoring } from '../services/recruitment';
import { formatDate } from '../utils/dateUtils';

export default function MyTasks() {
  const { userInfo } = useAuth();
  const mentorId = userInfo?.mentorId || userInfo?.id;

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [completingAssignment, setCompletingAssignment] = useState(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [assignmentLogsLoading, setAssignmentLogsLoading] = useState(false);
  const [logForm, setLogForm] = useState({ title: '', description: '', timeSpent: '00:00', meetingSchedule: '' });

  useEffect(() => {
    if (mentorId) {
      fetchAssignments();
    }
  }, [mentorId]);

  async function fetchAssignments() {
    setAssignmentsLoading(true);
    try {
      const data = await getMentorAssignments(mentorId);
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
    setAssignmentsLoading(false);
  }

  async function openAssignmentDetail(assignment) {
    setSelectedAssignment(assignment);
    setAssignmentDetail(null);
    setShowAssignmentDetail(true);
    setAssignmentLogsLoading(true);
    try {
      const detail = await getAssignmentDetail(mentorId, assignment._id);
      setAssignmentDetail(detail);
    } catch (err) {
      console.error('Error fetching assignment detail:', err);
      alert('Failed to load assignment detail');
    }
    setAssignmentLogsLoading(false);
  }

  function closeAssignmentDetail() {
    setSelectedAssignment(null);
    setAssignmentDetail(null);
    setShowAssignmentDetail(false);
    setLogForm({ title: '', description: '', timeSpent: '00:00', meetingSchedule: '' });
  }

  async function handleAddAssignmentLog(e) {
    e.preventDefault();
    if (!selectedAssignment) return;
    setAssignmentLogsLoading(true);
    try {
      await addAssignmentLog(mentorId, selectedAssignment._id, {
        title: logForm.title,
        description: logForm.description,
        timeSpent: logForm.timeSpent,
        meetingSchedule: logForm.meetingSchedule || undefined
      });
      const detail = await getAssignmentDetail(mentorId, selectedAssignment._id);
      setAssignmentDetail(detail);
      setLogForm({ title: '', description: '', timeSpent: '00:00', meetingSchedule: '' });
    } catch (err) {
      console.error('Error adding assignment log:', err);
      alert('Failed to add log');
    }
    setAssignmentLogsLoading(false);
  }

  async function handleCompleteAssignment(assignment) {
    if (!window.confirm('Mark this assignment as completed?')) {
      return;
    }
    setCompletingAssignment(assignment._id);
    try {
      if (assignment.type === 'enquiry') {
        await completeMentoring(assignment.enquiryId);
      } else {
        await completeAssignment(mentorId, assignment._id);
      }
      await fetchAssignments();
      alert('Assignment marked as completed!');
    } catch (err) {
      console.error('Error completing assignment:', err);
      alert('Failed to complete assignment');
    } finally {
      setCompletingAssignment(null);
    }
  }

  const activeAssignments = assignments.filter(a => a.status === 'active' || !a.status);
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">View and complete assignments assigned to you.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tasks ({activeAssignments.length})</h3>
          {assignmentsLoading ? (
            <div className="text-gray-500">Loading assignments...</div>
          ) : activeAssignments.length === 0 ? (
            <div className="text-gray-500 bg-gray-50 p-4 rounded">No active tasks</div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <div key={assignment._id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">
                          {assignment.title || assignment.enquiryName || assignment.description}
                        </h4>
                      </div>
                      {assignment.description && (
                        <p className="text-sm text-gray-700 mb-2">{assignment.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {assignment.enquiryId && (
                          <div>
                            <span className="font-semibold">Enquiry:</span>{' '}
                            <Link to={`/enquiries/${assignment.enquiryId}`} className="text-blue-600 hover:underline">
                              {assignment.enquiryName}
                            </Link>
                          </div>
                        )}
                        {assignment.assignedBy && (
                          <div>
                            <span className="font-semibold">Assigned By:</span> {assignment.assignedBy?.name || 'Unknown'}
                          </div>
                        )}
                        {assignment.assignedAt && (
                          <div>
                            <span className="font-semibold">Assigned Date:</span> {formatDate(assignment.assignedAt)}
                          </div>
                        )}
                        {assignment.meetingSchedule && (
                          <div>
                            <span className="font-semibold">Meeting Schedule:</span> {formatDate(assignment.meetingSchedule)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => openAssignmentDetail(assignment)}
                        className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
                      >
                        Activity Logs
                      </button>
                      {(assignment.type === 'activity' || assignment.type === 'enquiry') && (
                        <button
                          onClick={() => handleCompleteAssignment(assignment)}
                          disabled={completingAssignment === assignment._id}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {completingAssignment === assignment._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-5 w-5" />
                              Complete
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Tasks ({completedAssignments.length})</h3>
          {completedAssignments.length === 0 ? (
            <div className="text-gray-500 bg-gray-50 p-4 rounded">No completed tasks</div>
          ) : (
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">
                      {assignment.title || assignment.enquiryName || assignment.description}
                    </h4>
                    <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                      Completed
                    </span>
                  </div>
                  {assignment.description && (
                    <p className="text-sm text-gray-700 mb-2">{assignment.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {assignment.enquiryId && (
                      <div>
                        <span className="font-semibold">Enquiry:</span>{' '}
                        <Link to={`/enquiries/${assignment.enquiryId}`} className="text-blue-600 hover:underline">
                          {assignment.enquiryName}
                        </Link>
                      </div>
                    )}
                    {assignment.assignedBy && (
                      <div>
                        <span className="font-semibold">Assigned By:</span> {assignment.assignedBy?.name || 'Unknown'}
                      </div>
                    )}
                    {assignment.completedAt && (
                      <div>
                        <span className="font-semibold">Completed Date:</span> {formatDate(assignment.completedAt)}
                      </div>
                    )}
                    {assignment.completedBy && (
                      <div>
                        <span className="font-semibold">Marked as Completed By:</span> {assignment.completedBy?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {showAssignmentDetail && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeAssignmentDetail}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Assignment Activity Logs</h3>
            {assignmentLogsLoading && <div className="text-gray-500 mb-3">Loading...</div>}
            {assignmentDetail && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {assignmentDetail.logs?.length || 0} log(s) recorded
                  </div>
                  <button
                    onClick={() => handleCompleteAssignment(selectedAssignment)}
                    disabled={
                      completingAssignment === selectedAssignment._id ||
                      (assignmentDetail && assignmentDetail.logs?.length === 0)
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {completingAssignment === selectedAssignment._id ? 'Completing...' : 'Mark Complete'}
                  </button>
                </div>

                <div className="border rounded p-4 bg-[#f4faf3] border-[#d7f0d6]">
                  <h4 className="font-semibold mb-2 text-[#2EAB2C]">Activity Log</h4>
                  {assignmentDetail.logs?.length === 0 && (
                    <div className="text-sm text-gray-600">No logs yet. Add one below.</div>
                  )}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {assignmentDetail.logs?.map(log => (
                      <div key={log._id} className="bg-white border border-[#e2f3e1] rounded p-3 shadow-sm">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#2EAB2C]"></span>
                            {formatDate(log.date)}
                          </span>
                          {log.timeSpent && log.timeSpent !== '00:00' && (
                            <span className="text-[#2EAB2C] font-semibold">Time: {log.timeSpent}</span>
                          )}
                        </div>
                        {log.title && <div className="font-semibold text-gray-900 text-sm mb-1">{log.title}</div>}
                        <div className="text-gray-800 text-sm whitespace-pre-wrap">{log.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddAssignmentLog} className="space-y-3 border-t pt-3">
                  <h4 className="font-semibold text-[#2EAB2C]">Add Log Entry</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={logForm.title}
                      onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Log title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      value={logForm.description}
                      onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      required
                      placeholder="What did you do to progress this task?"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Spent (HH:MM)</label>
                      <input
                        type="text"
                        value={logForm.timeSpent}
                        onChange={(e) => setLogForm({ ...logForm, timeSpent: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule (Optional)</label>
                      <input
                        type="datetime-local"
                        value={logForm.meetingSchedule}
                        onChange={(e) => setLogForm({ ...logForm, meetingSchedule: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={assignmentLogsLoading}
                      className="bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {assignmentLogsLoading ? 'Saving...' : 'Add Log'}
                    </button>
                    <button
                      type="button"
                      onClick={closeAssignmentDetail}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

