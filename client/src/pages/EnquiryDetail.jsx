import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, assignEnquiry, deleteEnquiry } from '../services/enquiries';
import { getAssessmentByEnquiryId, createAssessment } from '../services/assessments';
import { createFullAssessment, allocateMentoring, addCaseNote } from '../services/recruitment';
import { getApplicationByEnquiryId, uploadApplication } from '../services/applications';
import { getUsers } from '../services/users';
import { getMentors } from '../services/mentors';
import { useAuth } from '../contexts/AuthContext';
import FormFAssessmentTracker from '../components/FormFAssessmentTracker';
import { formatDate } from '../utils/dateUtils';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const DetailSection = ({ title, children, isOpen, onToggle }) => (
  <div className="mb-4 border rounded">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 focus:outline-none"
    >
      <h2 className="text-xl font-bold">{title}</h2>
      {isOpen ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
    </button>
    {isOpen && <div className="p-4">{children}</div>}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="mb-2 grid grid-cols-1 md:grid-cols-3 gap-2">
    <b className="md:col-span-1">{label}:</b>
    <span className="md:col-span-2">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '-')}</span>
  </div>
);

// Recruitment Flow Progress Component
const RecruitmentFlowProgress = ({ enquiry }) => {
  const stages = [
    { key: 'enquiry', name: 'Enquiry', icon: CheckCircleIcon },
    { key: 'initial', name: 'Initial Assessment', icon: CheckCircleIcon },
    { key: 'application', name: 'Application', icon: CheckCircleIcon },
    { key: 'formf', name: 'Form F Assessment', icon: CheckCircleIcon },
    { key: 'mentoring', name: 'Mentoring', icon: CheckCircleIcon },
    { key: 'approval', name: 'Approval', icon: CheckCircleIcon }
  ];

  const getCurrentStage = () => {
    if (enquiry.status === 'Completed' || enquiry.status === 'Approved') return 'approval';
    if (enquiry.mentorAllocation?.mentorId) return 'mentoring';
    if (enquiry.fullAssessment?.result) return 'formf';
    if (enquiry.initialAssessment?.result) return 'application';
    return 'initial';
  };

  const currentStageIndex = stages.findIndex(s => s.key === getCurrentStage());

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Recruitment Progress</h2>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const Icon = stage.icon;
          
          return (
            <div key={stage.key} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                {stage.name}
              </span>
              {index < stages.length - 1 && (
                <div className={`absolute w-full h-0.5 top-5 left-1/2 transform translate-x-1/2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} style={{ width: 'calc(100% - 2.5rem)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function EnquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // Enquiry State
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openSection, setOpenSection] = useState('enquiry');

  // Action States
  const [assigning, setAssigning] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [staffList, setStaffList] = useState([]);

  // Assessment State
  const [assessment, setAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [attachment, setAttachment] = useState('');
  const [status, setStatus] = useState('Pending');

  // Application State
  const [application, setApplication] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Full Assessment state (minimal)
  const [faRecommendation, setFaRecommendation] = useState('Proceed');
  const [faChecksDone, setFaChecksDone] = useState('');
  const [faNotes, setFaNotes] = useState('');
  const [faSubmitting, setFaSubmitting] = useState(false);

  // Mentoring allocation
  const [mentorId, setMentorId] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [allocSubmitting, setAllocSubmitting] = useState(false);
  const [mentorList, setMentorList] = useState([]);

  // Case note
  const [caseNote, setCaseNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);


  useEffect(() => {
    fetchEnquiry();
    fetchAssessment();
    fetchApplication();
    fetchStaff();
    fetchMentors();
    // eslint-disable-next-line
  }, [id]);

  async function fetchEnquiry() {
    setLoading(true);
    try {
      const data = await getEnquiryById(id);
      setEnquiry(data);
    } catch (err) {
      setError('Failed to fetch enquiry');
    }
    setLoading(false);
  }

  async function fetchAssessment() {
    setAssessmentLoading(true);
    try {
      const data = await getAssessmentByEnquiryId(id);
      setAssessment(data);
    } catch (err) {
      if (!(err.response && err.response.status === 404)) {
        console.error(err);
      }
      setAssessment(null); // No assessment yet
    }
    setAssessmentLoading(false);
  }

  async function fetchApplication() {
    setApplicationLoading(true);
    try {
      const data = await getApplicationByEnquiryId(id);
      setApplication(data);
    } catch (err) {
      if (!(err.response && err.response.status === 404)) {
        console.error(err);
      }
      setApplication(null); // No application yet
    }
    setApplicationLoading(false);
  }

  async function fetchStaff() {
    try {
      const users = await getUsers();
      setStaffList(users.filter(u => u.role === 'staff' || u.role === 'admin'));
    } catch (err) {
      setStaffList([]);
    }
  }

  async function fetchMentors() {
    try {
      const mentors = await getMentors();
      setMentorList(mentors);
    } catch (err) {
      setMentorList([]);
    }
  }

  async function handleAssign() {
    await assignEnquiry(id, staffId);
    setAssigning(false);
    setStaffId('');
    fetchEnquiry();
  }

  async function handleAssessmentSubmit(e) {
    e.preventDefault();
    await createAssessment({
      enquiry_id: id,
      staff_id: userInfo?.id,
      assessment_notes: notes,
      assessment_date: date,
      attachments: attachment,
      status,
    });
    setNotes(''); setDate(''); setAttachment(''); setStatus('Pending');
    fetchAssessment();
  }

  async function handleApplicationUpload(e) {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('applicationForm', selectedFile);
    formData.append('enquiryId', id);

    try {
      await uploadApplication(formData); // assume this makes a POST request
      await fetchApplication(); // refetch the updated data

      // Optional: Show success feedback (toast, message, etc.)
      alert('File uploaded successfully.');

      // Clear file input
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateFullAssessment(e) {
    e.preventDefault();
    setFaSubmitting(true);
    try {
      await createFullAssessment({
        enquiryId: id,
        recommendation: faRecommendation,
        checksDone: faChecksDone ? faChecksDone.split(',').map(s => s.trim()).filter(Boolean) : [],
        notes: faNotes,
      });
      alert('Full assessment saved.');
    } catch (err) {
      alert('Failed to save full assessment');
    }
    setFaSubmitting(false);
  }

  async function handleAllocateMentor(e) {
    e.preventDefault();
    setAllocSubmitting(true);
    try {
      await allocateMentoring({ enquiryId: id, mentorId, meetingSchedule });
      alert('Mentor allocated.');
    } catch (err) {
      alert('Failed to allocate mentor');
    }
    setAllocSubmitting(false);
  }

  async function handleAddCaseNote(e) {
    e.preventDefault();
    if (!caseNote.trim()) return;
    setNoteSubmitting(true);
    try {
      await addCaseNote({ enquiryId: id, content: caseNote });
      setCaseNote('');
      alert('Case note added.');
    } catch (err) {
      alert('Failed to add case note');
    }
    setNoteSubmitting(false);
  }
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    setLoading(true);
    try {
      await deleteEnquiry(id);
      fetchEnquiry();
      navigate('/enquiries');
    } catch (err) {
      setError('Failed to delete enquiry');
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!enquiry) return <div>Enquiry not found.</div>;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <button className="mb-4 text-[#2EAB2C] hover:underline" onClick={() => navigate(-1)}>&larr; Back to List</button>

      {/* Recruitment Progress */}
      <RecruitmentFlowProgress enquiry={enquiry} />

      {/* Enquiry Details Section */}
      <DetailSection title="Enquiry Details" isOpen={openSection === 'enquiry'} onToggle={() => toggleSection('enquiry')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <DetailRow label="Name" value={enquiry.full_name} />
            <DetailRow label="Email" value={enquiry.email_address} />
            <DetailRow label="Phone" value={enquiry.telephone} />
            <DetailRow label="Submission Date" value={formatDate(enquiry.submission_date)} />
          </div>
          <div>
            <DetailRow label="Status" value={enquiry.status} />
            <DetailRow label="Assigned To" value={enquiry.assigned_to_name || '-'} />
            <DetailRow label="Location" value={enquiry.location} />
            <DetailRow label="Post Code" value={enquiry.post_code} />
          </div>
        </div>
        
        {!enquiry.assigned_to && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Assign Staff Member</h3>
            {assigning ? (
              <div className="flex gap-2 items-center">
                <select
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  className="border px-3 py-2 rounded"
                >
                  <option value="">Select Staff Member</option>
                  {staffList.map(staff => (
                    <option key={staff.id || staff._id} value={staff.id || staff._id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={handleAssign} disabled={!staffId}>Assign</button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setAssigning(false)}>Cancel</button>
              </div>
            ) : (
              <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => setAssigning(true)}>Assign Staff Member</button>
            )}
          </div>
        )}
      </DetailSection>

      {/* Personal Details Section */}
      <DetailSection title="Personal Details" isOpen={openSection === 'personal'} onToggle={() => toggleSection('personal')}>
        <DetailRow label="Telephone" value={enquiry.telephone} />
        <DetailRow label="Location" value={enquiry.location} />
        <DetailRow label="Post Code" value={enquiry.post_code} />
        <DetailRow label="Nationality" value={enquiry.nationality} />
        <DetailRow label="Ethnicity" value={enquiry.ethnicity} />
        <DetailRow label="Sexual Orientation" value={enquiry.sexual_orientation} />
        <DetailRow label="Over 21?" value={enquiry.over_21} />
        <DetailRow label="Date of Birth" value={formatDate(enquiry.dob)} />
        <DetailRow label="Occupation" value={enquiry.occupation} />
      </DetailSection>

      {/* Fostering Details Section */}
      <DetailSection title="Fostering Details" isOpen={openSection === 'fostering'} onToggle={() => toggleSection('fostering')}>
        <DetailRow label="Foster as a couple?" value={enquiry.foster_as_couple} />
        <DetailRow label="Has a spare room?" value={enquiry.has_spare_room} />
        <DetailRow label="Property & Bedroom Details" value={enquiry.property_bedrooms_details} />
      </DetailSection>

      {/* Experience & Checks Section */}
      <DetailSection title="Experience & Checks" isOpen={openSection === 'experience'} onToggle={() => toggleSection('experience')}>
        <DetailRow label="Children or caring responsibilities?" value={enquiry.has_children_or_caring_responsibilities} />
        <DetailRow label="Previously investigated by social services?" value={enquiry.previous_investigation} />
        <DetailRow label="Previous fostering/childcare experience?" value={enquiry.previous_experience} />
      </DetailSection>

      {/* Motivation & Support Section */}
      <DetailSection title="Motivation & Support" isOpen={openSection === 'motivation'} onToggle={() => toggleSection('motivation')}>
        <DetailRow label="Motivation for fostering" value={enquiry.motivation} />
        <DetailRow label="Support needs" value={enquiry.support_needs} />
      </DetailSection>

      {/* Availability & Confirmation Section */}
      <DetailSection title="Availability & Confirmation" isOpen={openSection === 'availability'} onToggle={() => toggleSection('availability')}>
        <DetailRow label="Availability for follow-up call" value={enquiry.availability_for_call} />
        <DetailRow label="How did you hear about us?" value={enquiry.how_did_you_hear} />
        <DetailRow label="Information confirmed correct?" value={enquiry.information_correct_confirmation} />
      </DetailSection>

      {/* Initial Assessment Section */}
      <DetailSection title="1. Initial Assessment" isOpen={openSection === 'assessment'} onToggle={() => toggleSection('assessment')}>
        {assessmentLoading ? (
          <div>Loading assessment...</div>
        ) : assessment ? (
          <div>
            <DetailRow label="Staff ID" value={assessment.staff_id} />
            <DetailRow label="Notes" value={assessment.assessment_notes} />
            <DetailRow label="Date" value={formatDate(assessment.assessment_date)} />
            <DetailRow label="Attachment" value={assessment.attachments} />
            <DetailRow label="Status" value={assessment.status} />
          </div>
        ) : (
          <form onSubmit={handleAssessmentSubmit}>
            <div className="mb-2"><label className="block font-semibold mb-1">Assessment Notes</label><textarea className="w-full border rounded px-2 py-1" value={notes} onChange={e => setNotes(e.target.value)} required /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Date</label><input type="date" className="w-full border rounded px-2 py-1" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Attachment (URL)</label><input type="text" className="w-full border rounded px-2 py-1" value={attachment} onChange={e => setAttachment(e.target.value)} /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Status</label><select className="w-full border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-2">Submit Assessment</button>
          </form>
        )}
      </DetailSection>

      {/* Application Form Section */}
      <DetailSection title="2. Application Documents" isOpen={openSection === 'application'} onToggle={() => toggleSection('application')}>
        {applicationLoading ? (
          <div>Loading application...</div>
        ) : (
          <div className="space-y-4">
            {application ? (
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <DetailRow label="Status" value={application.status} />
                <p className="mt-2">
                  <b>File:</b>{" "}
                  <a
                    href={`https://backendcrm.blackfostercarersalliance.co.uk/${application.application_form_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2EAB2C] hover:underline break-all"
                  >
                    {application.application_form_path}
                  </a>
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No application uploaded yet.</p>
            )}

            {/* Upload Form */}
            <form onSubmit={handleApplicationUpload} className="bg-white p-4 rounded shadow-sm space-y-3">
              <label className="block text-sm font-medium text-gray-700">Upload Application Form (PDF):</label>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={e => setSelectedFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-[#2EAB2C]
            hover:file:bg-gray-600"
                  accept=".pdf,.doc,.docx"
                />
                {selectedFile && (
                  <span className="text-sm text-[#2EAB2C] truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={uploading}
              >
                {uploading && (
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        )}

      </DetailSection>

      {/* Form F Assessment Section */}
      <DetailSection title="3. Form F Assessment" isOpen={openSection === 'fullAssessment'} onToggle={() => toggleSection('fullAssessment')}>
        <form onSubmit={handleCreateFullAssessment} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Recommendation</label>
            <select className="w-full border rounded px-2 py-1" value={faRecommendation} onChange={e => setFaRecommendation(e.target.value)}>
              <option>Proceed</option>
              <option>Do not proceed</option>
              <option>Hold</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Checks Done (comma separated)</label>
            <input className="w-full border rounded px-2 py-1" placeholder="DBS, References, Home Safety" value={faChecksDone} onChange={e => setFaChecksDone(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea className="w-full border rounded px-2 py-1" value={faNotes} onChange={e => setFaNotes(e.target.value)} />
          </div>
          <button type="submit" disabled={faSubmitting} className="bg-blue-600 text-white px-3 py-2 rounded">{faSubmitting ? 'Saving...' : 'Save Full Assessment'}</button>
        </form>
      </DetailSection>

      {/* Mentoring Allocation */}
      <DetailSection title="4. Mentoring Allocation" isOpen={openSection === 'mentoring'} onToggle={() => toggleSection('mentoring')}>
        <form onSubmit={handleAllocateMentor} className="space-y-3">
          <div>
            <label className="block font-semibold mb-1">Select Mentor</label>
            <select 
              className="w-full border rounded px-2 py-1" 
              value={mentorId} 
              onChange={e => setMentorId(e.target.value)}
              required
            >
              <option value="">Select a Mentor</option>
              {mentorList.map(mentor => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name} - {mentor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Meeting Schedule</label>
            <input className="w-full border rounded px-2 py-1" placeholder="e.g. Weekly meetings" value={meetingSchedule} onChange={e => setMeetingSchedule(e.target.value)} />
          </div>
          <button type="submit" disabled={allocSubmitting || !mentorId} className="bg-purple-600 text-white px-3 py-2 rounded disabled:opacity-50">{allocSubmitting ? 'Allocating...' : 'Allocate Mentor'}</button>
        </form>
      </DetailSection>

      {/* Case Notes */}
      <DetailSection title="Case Notes" isOpen={openSection === 'caseNotes'} onToggle={() => toggleSection('caseNotes')}>
        <form onSubmit={handleAddCaseNote} className="space-y-3">
          <textarea className="w-full border rounded px-2 py-1" placeholder="Add case note" value={caseNote} onChange={e => setCaseNote(e.target.value)} />
          <button type="submit" disabled={noteSubmitting} className="bg-gray-800 text-white px-3 py-2 rounded">{noteSubmitting ? 'Adding...' : 'Add Note'}</button>
        </form>
      </DetailSection>

      {/* Form F Assessment Tracker Section */}
      <DetailSection title="3. Form F Assessment Tracker" isOpen={openSection === 'formf'} onToggle={() => toggleSection('formf')}>
        <FormFAssessmentTracker enquiryId={id} />
      </DetailSection>

      {/* Final Approval Section */}
      <DetailSection title="5. Final Approval" isOpen={openSection === 'approval'} onToggle={() => toggleSection('approval')}>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Ready for Approval</h3>
            <p className="text-green-700 text-sm mb-4">
              This candidate has completed all stages of the recruitment process and is ready for final approval.
            </p>
            <div className="flex gap-2">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to approve this candidate?')) {
                    // Handle approval logic here
                    alert('Candidate approved successfully!');
                  }
                }}
              >
                Approve Candidate
              </button>
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reject this candidate?')) {
                    // Handle rejection logic here
                    alert('Candidate rejected.');
                  }
                }}
              >
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      </DetailSection>

      {/* Admin Actions */}
      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <h3 className="font-semibold text-red-800 mb-2">Admin Actions</h3>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
              handleDelete(enquiry._id);
            }
          }}
        >
          Delete Enquiry
        </button>
      </div>
    </div>
  );
} 