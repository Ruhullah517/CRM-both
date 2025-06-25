import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnquiries, approveEnquiry, rejectEnquiry, assignEnquiry } from '../services/enquiries';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [staffId, setStaffId] = useState('');
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

  async function handleApprove(id) {
    await approveEnquiry(id);
    fetchEnquiries();
  }

  async function handleReject(id) {
    await rejectEnquiry(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
    fetchEnquiries();
  }

  async function handleAssign(id) {
    await assignEnquiry(id, staffId);
    setAssigningId(null);
    setStaffId('');
    fetchEnquiries();
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Initial Enquiry List</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Submission Date</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Assigned To</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map(enq => (
            <tr key={enq.id}>
              <td className="border px-4 py-2">{enq.name}</td>
              <td className="border px-4 py-2">{enq.email}</td>
              <td className="border px-4 py-2">{new Date(enq.submission_date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{enq.status}</td>
              <td className="border px-4 py-2">{enq.assigned_to || '-'}</td>
              <td className="border px-4 py-2 space-x-2">
                <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => navigate(`/enquiries/${enq.id}`)}>View</button>
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleApprove(enq.id)} disabled={enq.status === 'Approved'}>Approve</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => setRejectingId(enq.id)} disabled={enq.status === 'Rejected'}>Reject</button>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setAssigningId(enq.id)}>Assign</button>
                {rejectingId === enq.id && (
                  <span className="ml-2">
                    <input
                      type="text"
                      placeholder="Reason"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                    <button className="bg-red-700 text-white px-2 py-1 rounded ml-1" onClick={() => handleReject(enq.id)}>Confirm</button>
                    <button className="ml-1" onClick={() => setRejectingId(null)}>Cancel</button>
                  </span>
                )}
                {assigningId === enq.id && (
                  <span className="ml-2">
                    <input
                      type="text"
                      placeholder="Staff ID"
                      value={staffId}
                      onChange={e => setStaffId(e.target.value)}
                      className="border px-2 py-1 rounded"
                    />
                    <button className="bg-yellow-700 text-white px-2 py-1 rounded ml-1" onClick={() => handleAssign(enq.id)}>Confirm</button>
                    <button className="ml-1" onClick={() => setAssigningId(null)}>Cancel</button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 