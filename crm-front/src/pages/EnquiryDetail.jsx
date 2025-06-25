import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEnquiryById, approveEnquiry, rejectEnquiry, assignEnquiry } from '../services/enquiries';
import { getAssessmentByEnquiryId, createAssessment } from '../services/assessments';
import { getApplicationByEnquiryId, uploadApplication } from '../services/applications';
import { useAuth } from '../contexts/AuthContext';
import FormFAssessmentTracker from '../components/FormFAssessmentTracker';

export default function EnquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // Enquiry State
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action States
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [staffId, setStaffId] = useState('');

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

  useEffect(() => {
    fetchEnquiry();
    fetchAssessment();
    fetchApplication();
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

    const formData = new FormData();
    formData.append('applicationForm', selectedFile);
    formData.append('enquiryId', id);

    try {
      await uploadApplication(formData);
      fetchApplication();
    } catch (err) {
      alert('File upload failed.');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!enquiry) return <div>Enquiry not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8 mb-8">
      <button className="mb-4 text-blue-600 hover:underline" onClick={() => navigate(-1)}>&larr; Back to List</button>
      
      {/* Enquiry Details Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Enquiry Details</h1>
        <div className="mb-2"><b>Name:</b> {enquiry.name}</div>
        <div className="mb-2"><b>Email:</b> {enquiry.email}</div>
        <div className="mb-2"><b>Submission Date:</b> {new Date(enquiry.submission_date).toLocaleDateString()}</div>
        <div className="mb-2"><b>Status:</b> {enquiry.status}</div>
        <div className="mb-2"><b>Assigned To:</b> {enquiry.assigned_to || '-'}</div>
        {enquiry.status === 'Rejected' && (
          <div className="mb-2 text-red-600"><b>Rejection Reason:</b> {enquiry.rejection_reason}</div>
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
            <input type="text" placeholder="Staff ID" value={staffId} onChange={e => setStaffId(e.target.value)} className="border px-2 py-1 rounded" />
            <button className="bg-yellow-700 text-white px-2 py-1 rounded" onClick={handleAssign}>Confirm</button>
            <button className="ml-1" onClick={() => setAssigning(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Initial Assessment Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Initial Assessment</h2>
        {assessmentLoading ? (
          <div>Loading assessment...</div>
        ) : assessment ? (
          <div className="bg-gray-50 p-4 rounded">
            <div><b>Staff ID:</b> {assessment.staff_id}</div>
            <div><b>Notes:</b> {assessment.assessment_notes}</div>
            <div><b>Date:</b> {assessment.assessment_date}</div>
            <div><b>Attachment:</b> {assessment.attachments || '-'}</div>
            <div><b>Status:</b> {assessment.status}</div>
          </div>
        ) : (
          <form className="bg-gray-50 p-4 rounded" onSubmit={handleAssessmentSubmit}>
            <div className="mb-2"><label className="block font-semibold mb-1">Assessment Notes</label><textarea className="w-full border rounded px-2 py-1" value={notes} onChange={e => setNotes(e.target.value)} required /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Date</label><input type="date" className="w-full border rounded px-2 py-1" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Attachment (URL)</label><input type="text" className="w-full border rounded px-2 py-1" value={attachment} onChange={e => setAttachment(e.target.value)} /></div>
            <div className="mb-2"><label className="block font-semibold mb-1">Status</label><select className="w-full border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-2">Submit Assessment</button>
          </form>
        )}
      </div>
{/* Application Form Section */}
<div>
        <h2 className="text-xl font-bold mb-2">Application Form</h2>
        {applicationLoading ? (
          <div>Loading application...</div>
        ) : (
          <div className="bg-gray-50 p-4 rounded">
            {application ? (
              <div>
                <p><b>Status:</b> {application.status}</p>
                <p><b>File:</b> <a href={`http://localhost:3001/${application.application_form_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.application_form_path}</a></p>
              </div>
            ) : (
              <p>No application uploaded yet.</p>
            )}
            <form onSubmit={handleApplicationUpload} className="mt-4">
              <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="mb-2" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
            </form>
          </div>
        )}
      </div>
      {/* Form F Assessment Tracker Section */}
      <FormFAssessmentTracker enquiryId={id} />

      
    </div>
  );
} 