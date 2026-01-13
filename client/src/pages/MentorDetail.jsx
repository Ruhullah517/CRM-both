import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';
import { 
  getMentor, 
  updateMentor, 
  deleteMentor,
  getMentorActivities,
  logMentorActivity,
  getMentorAssignments,
  completeAssignment,
  getAssignmentDetail,
  addAssignmentLog,
} from '../services/mentors';
import { completeMentoring } from '../services/recruitment';
import { useAuth } from '../contexts/AuthContext';

export default function MentorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrStaff = user?.user?.role === 'admin' || user?.user?.role === 'staff' || user?.role === 'admin' || user?.role === 'staff';

  const [activeTab, setActiveTab] = useState('profile');
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentLogsLoading, setAssignmentLogsLoading] = useState(false);
  const [logForm, setLogForm] = useState({ title: '', description: '', timeSpent: '00:00', meetingSchedule: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [completingAssignment, setCompletingAssignment] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    skills: [],
    specialization: '',
    qualifications: '',
    status: 'Active',
    notes: ''
  });

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    activityType: 'note',
    description: '',
    date: new Date().toISOString().split('T')[0],
    timeSpent: '00:00',
    meetingSchedule: ''
  });
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Assignment form state (for manual assignment creation)
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    enquiryId: '',
    meetingSchedule: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMentor();
    fetchActivities();
    fetchAssignments();
  }, [id]);

  async function fetchMentor() {
    setLoading(true);
    try {
      const data = await getMentor(id);
      setMentor(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        specialization: data.specialization || '',
        qualifications: data.qualifications || '',
        status: data.status || 'Active',
        notes: data.notes || ''
      });
    } catch (err) {
      console.error('Error fetching mentor:', err);
      alert('Failed to load mentor');
    }
    setLoading(false);
  }

  async function fetchActivities() {
    setActivitiesLoading(true);
    try {
      const data = await getMentorActivities(id);
      // Filter out assignment activities (they're shown in assignments tab)
      setActivities((data || []).filter(a => a.activityType !== 'assignment'));
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
    setActivitiesLoading(false);
  }

  async function fetchAssignments() {
    setAssignmentsLoading(true);
    try {
      const data = await getMentorAssignments(id);
      setAssignments(data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
    setAssignmentsLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMentor(id, {
        ...formData,
        skills: typeof formData.skills === 'string' 
          ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : formData.skills
      });
      await fetchMentor();
      setEditing(false);
      alert('Mentor updated successfully!');
    } catch (err) {
      console.error('Error updating mentor:', err);
      alert('Failed to update mentor');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await deleteMentor(id);
      alert('Mentor deleted successfully!');
      navigate('/mentors');
    } catch (err) {
      console.error('Error deleting mentor:', err);
      alert('Failed to delete mentor');
      setDeleting(false);
    }
  }

  async function handleSubmitActivity(e) {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      await logMentorActivity(id, activityForm);
      setActivityForm({
        activityType: 'note',
        description: '',
        date: new Date().toISOString().split('T')[0],
        timeSpent: '00:00',
        meetingSchedule: ''
      });
      await fetchActivities();
      alert('Activity logged successfully!');
    } catch (err) {
      console.error('Error logging activity:', err);
      alert('Failed to log activity');
    }
    setSubmittingActivity(false);
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
        await completeAssignment(id, assignment._id);
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

  async function handleSubmitAssignment(e) {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      await logMentorActivity(id, {
        activityType: 'assignment',
        title: assignmentForm.title,
        description: assignmentForm.description,
        enquiryId: assignmentForm.enquiryId || undefined,
        date: assignmentForm.date,
        meetingSchedule: assignmentForm.meetingSchedule || undefined
      });
      setAssignmentForm({
        title: '',
        description: '',
        enquiryId: '',
        meetingSchedule: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAssignmentForm(false);
      await fetchAssignments();
      alert('Assignment created successfully!');
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('Failed to create assignment');
    }
    setSubmittingActivity(false);
  }

  async function openAssignmentDetail(assignment) {
    setSelectedAssignment(assignment);
    setAssignmentDetail(null);
    setAssignmentLogsLoading(true);
    try {
      const detail = await getAssignmentDetail(id, assignment._id);
      setAssignmentDetail(detail);
    } catch (err) {
      console.error('Error fetching assignment detail:', err);
      alert('Failed to load assignment detail');
    }
    setAssignmentLogsLoading(false);
  }

  async function handleAddAssignmentLog(e) {
    e.preventDefault();
    if (!selectedAssignment) return;
    setAssignmentLogsLoading(true);
    try {
      await addAssignmentLog(id, selectedAssignment._id, {
        title: logForm.title,
        description: logForm.description,
        timeSpent: logForm.timeSpent,
        meetingSchedule: logForm.meetingSchedule || undefined
      });
      const detail = await getAssignmentDetail(id, selectedAssignment._id);
      setAssignmentDetail(detail);
      setLogForm({ title: '', description: '', timeSpent: '00:00', meetingSchedule: '' });
    } catch (err) {
      console.error('Error adding assignment log:', err);
      alert('Failed to add log');
    }
    setAssignmentLogsLoading(false);
  }

  function closeAssignmentDetail() {
    setSelectedAssignment(null);
    setAssignmentDetail(null);
    setLogForm({ description: '', timeSpent: '00:00', meetingSchedule: '' });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeAssignments = assignments.filter(a => a.status === 'active' || !a.status);
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!mentor) {
    return <div className="p-6">Mentor not found</div>;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'assignments', name: 'Assignments', icon: ClipboardDocumentListIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button 
          className="mb-4 text-[#2EAB2C] hover:underline flex items-center gap-2" 
          onClick={() => navigate('/mentors')}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Mentors
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{mentor.name}</h1>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mentor.status)}`}>
                {mentor.status}
              </span>
            </div>
            {isAdminOrStaff && !editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  Edit Profile
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-[#2EAB2C] text-[#2EAB2C]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Profile Information</h2>
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                      <input
                        type="text"
                        value={formData.qualifications}
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Assessment, Training, Support"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchMentor();
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="font-semibold text-gray-700">Email:</span>
                    <p className="text-gray-900 mt-1">{mentor.email || '-'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone:</span>
                    <p className="text-gray-900 mt-1">{mentor.phone || '-'}</p>
                  </div>
                  {mentor.address && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Address:</span>
                      <p className="text-gray-900 mt-1">{mentor.address}</p>
                    </div>
                  )}
                  {mentor.specialization && (
                    <div>
                      <span className="font-semibold text-gray-700">Specialization:</span>
                      <p className="text-gray-900 mt-1">{mentor.specialization}</p>
                    </div>
                  )}
                  {mentor.qualifications && (
                    <div>
                      <span className="font-semibold text-gray-700">Qualifications:</span>
                      <p className="text-gray-900 mt-1">{mentor.qualifications}</p>
                    </div>
                  )}
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Skills:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mentor.skills.map((skill, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {mentor.notes && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-gray-700">Notes:</span>
                      <p className="text-gray-900 mt-1 whitespace-pre-wrap">{mentor.notes}</p>
                    </div>
                  )}
                  {mentor.joinDate && (
                    <div>
                      <span className="font-semibold text-gray-700">Join Date:</span>
                      <p className="text-gray-900 mt-1">{formatDate(mentor.joinDate)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Assignments</h2>
                {isAdminOrStaff && (
                  <button
                    onClick={() => setShowAssignmentForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Create Assignment
                  </button>
                )}
              </div>

              {/* Active Assignments */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Assignments ({activeAssignments.length})</h3>
                {assignmentsLoading ? (
                  <div className="text-gray-500">Loading assignments...</div>
                ) : activeAssignments.length === 0 ? (
                  <div className="text-gray-500 bg-gray-50 p-4 rounded">No active assignments</div>
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

              {/* Completed Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Assignments ({completedAssignments.length})</h3>
                {completedAssignments.length === 0 ? (
                  <div className="text-gray-500 bg-gray-50 p-4 rounded">No completed assignments</div>
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
          )}

          {/* Activities Tab removed */}
        </div>
      </div>

      {/* Assignment Creation Modal */}
      {showAssignmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAssignmentForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Create New Assignment</h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  required
                  placeholder="Describe the assignment..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date</label>
                <input
                  type="date"
                  value={assignmentForm.date}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={assignmentForm.meetingSchedule}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, meetingSchedule: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingActivity}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingActivity ? 'Creating...' : 'Create Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
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
                      placeholder="What did you do to progress this assignment?"
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
