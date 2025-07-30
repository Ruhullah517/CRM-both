import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, approveEnquiry, rejectEnquiry, assignEnquiry } from '../services/enquiries';
import { getAssessmentByEnquiryId, createAssessment } from '../services/assessments';
import { getApplicationByEnquiryId, uploadApplication } from '../services/applications';
import { getUsers } from '../services/users';
import { useAuth } from '../contexts/AuthContext';
import FormFAssessmentTracker from '../components/FormFAssessmentTracker';
import { formatDate } from '../utils/dateUtils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

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
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
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


  useEffect(() => {
    fetchEnquiry();
    fetchAssessment();
    fetchApplication();
    fetchStaff();
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
      setStaffList(users.filter(u => u.role === 'staff'));
    } catch (err) {
      setStaffList([]);
    }
  }

  async function handleApprove() {
    await approveEnquiry(id);
    fetchEnquiry();
  }

  async function handleReject() {
    await rejectEnquiry(id, rejectReason);
    setRejecting(false);
    setRejectReason('');
    fetchEnquiry();
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


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!enquiry) return <div>Enquiry not found.</div>;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8 mb-8">
      <button className="mb-4 text-blue-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back to List</button>

      {/* Enquiry Details Section */}
      <DetailSection title="Enquiry Details" isOpen={openSection === 'enquiry'} onToggle={() => toggleSection('enquiry')}>
        <DetailRow label="Name" value={enquiry.full_name} />
        <DetailRow label="Email" value={enquiry.email_address} />
        <DetailRow label="Submission Date" value={formatDate(enquiry.submission_date)} />
        <DetailRow label="Status" value={enquiry.status} />
        <DetailRow label="Assigned To" value={enquiry.assigned_to_name || '-'} />
        {enquiry.status === 'Rejected' && (
          <DetailRow label="Rejection Reason" value={enquiry.rejection_reason} />
        )}
        <div className="flex gap-2 mt-4">
          <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleApprove} disabled={enquiry.status === 'Approved'}>Approve</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => setRejecting(true)} disabled={enquiry.status === 'Rejected'}>Reject</button>
          <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => setAssigning(true)}>Assign</button>
        </div>
        {rejecting && (
          <div className="mt-4 flex gap-2 items-center">
            <input type="text" placeholder="Reason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="border px-2 py-1 rounded" />
            <button className="bg-red-700 text-white px-2 py-1 rounded" onClick={handleReject}>Confirm</button>
            <button className="ml-1" onClick={() => setRejecting(false)}>Cancel</button>
          </div>
        )}
        {assigning && (
          <div className="mt-4 flex gap-2 items-center">
            <select
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">Select Staff</option>
              {staffList.map(staff => (
                <option key={staff.id || staff._id} value={staff.id || staff._id}>
                  {staff.name}
                </option>
              ))}
            </select>
            <button className="bg-yellow-700 text-white px-2 py-1 rounded" onClick={handleAssign} disabled={!staffId}>Confirm</button>
            <button className="ml-1" onClick={() => setAssigning(false)}>Cancel</button>
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
      <DetailSection title="Initial Assessment" isOpen={openSection === 'assessment'} onToggle={() => toggleSection('assessment')}>
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
      <DetailSection title="Application Form" isOpen={openSection === 'application'} onToggle={() => toggleSection('application')}>
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
                    href={`https://crm-backend-0v14.onrender.com/${application.application_form_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
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
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx"
                />
                {selectedFile && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
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

      {/* Form F Assessment Tracker Section */}
      <DetailSection title="Form F Assessment" isOpen={openSection === 'formf'} onToggle={() => toggleSection('formf')}>
        <FormFAssessmentTracker enquiryId={id} />
      </DetailSection>

    </div>
  );
} 