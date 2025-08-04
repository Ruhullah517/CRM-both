import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getCandidates, createCandidate, updateCandidate, deleteCandidate } from '../services/candidates';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const stages = ['Inquiry', 'Application', 'Assessment', 'Mentoring', 'Final Approval'];
const statuses = ['New', 'Active', 'Paused', 'Completed'];
const mentors = ['John Doe', 'Jane Lee', 'Sarah Brown'];

const statusColors = {
  new: 'bg-gray-200 text-gray-800',
  active: 'bg-green-100 text-[#2EAB2C]',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
};
const stageColors = {
  'Initial Enquiry': 'bg-gray-100 text-gray-700',
  Application: 'bg-yellow-100 text-yellow-700',
  Assessment: 'bg-blue-100 text-blue-700',
  Mentoring: 'bg-purple-100 text-purple-700',
  Approval: 'bg-green-100 text-[#2EAB2C]',
};

const CandidateList = ({ onSelect, onAdd, candidates, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Candidate</button>
      </div>
      {/* Table for sm and up */}
      <div className="overflow-x-auto rounded shadow bg-white hidden sm:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2">Mentor</th>
              <th className="px-4 py-2">Deadline</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${stageColors[c.stage]}`}>{c.stage}</span>
                </td>
                <td className="px-4 py-2">{c.mentor}</td>
                <td className="px-4 py-2">{formatDate(c.deadline)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-black text-white font-semibold hover:bg-gray-600">
                    View
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => onDelete(c)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {filtered.map(c => (
          <div key={c._id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{c.name}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status]}`}>{c.status}</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Stage:</span>{" "}
              <span className={`px-2 py-1 rounded text-xs font-semibold ${stageColors[c.stage]}`}>{c.stage}</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Mentor:</span> {c.mentor}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Deadline:</span> {formatDate(c.deadline)}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onSelect(c)}
                className="flex-1 px-3 py-2 rounded bg-black text-white font-semibold hover:bg-gray-600"
              >
                View
              </button>
              <button
                onClick={() => onDelete(c)}
                className="flex-1 px-3 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CandidateDetail = ({ candidate, onBack, onEdit }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-2">{candidate.name}</h2>
    <div className="mb-2"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[candidate.status]}`}>{candidate.status}</span></div>
    <div className="mb-2"><span className="font-semibold">Stage:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${stageColors[candidate.stage]}`}>{candidate.stage}</span></div>
    <div className="mb-2"><span className="font-semibold">Mentor:</span> {candidate.mentor}</div>
    <div className="mb-2"><span className="font-semibold">Deadline:</span> {formatDate(candidate.deadline)}</div>
    <h3 className="font-semibold mt-4 mb-1">Notes</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{(candidate.notes || []).map((n, i) => <li key={i}>{n.text} <span className="text-gray-400">({n.date})</span></li>)}</ul>
    <h3 className="font-semibold mb-1">Documents</h3>
    <ul className="mb-2 text-sm">
      {(candidate.documents || []).map((d, i) =>
        <li key={i} className="flex items-center gap-2">
          <a
            href={d.url}
            className="text-blue-700 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {d.name}
          </a>
          <a
            href={d.url}
            download
            className="text-gray-500 hover:text-blue-700 text-xs"
            title="Download"
          >
            ⬇️
          </a>
        </li>
      )}
    </ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const CandidateForm = ({ candidate, onBack, onSave }) => {
  const [name, setName] = useState(candidate?.name || "");
  const [mentor, setMentor] = useState(candidate?.mentor || "");
  const [deadline, setDeadline] = useState(candidate?.deadline || "");
  const [status, setStatus] = useState(candidate?.status || "New");
  const [stage, setStage] = useState(candidate?.stage || "Inquiry");
  const [email, setEmail] = useState(candidate?.email || "");
  const [notes, setNotes] = useState(candidate?.notes || []);
  const [documents, setDocuments] = useState(candidate?.documents || []);
  const [newNote, setNewNote] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleDocumentUpload() {
    if (!newDocumentFile || !newDocumentName) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", newDocumentFile);
    formData.append("name", newDocumentName);

    // Adjust the URL to your backend endpoint
    const res = await fetch("/api/candidates/upload-document", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setDocuments([...documents, { name: newDocumentName, url: data.url }]);
      setNewDocumentName("");
      setNewDocumentFile(null);
    }
    setUploading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...candidate,
      name,
      mentor,
      deadline,
      status,
      stage,
      email,
      notes,
      documents,
      _id: candidate?._id,
    });
  }
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{candidate ? "Edit" : "Add"} Candidate</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded">
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={stage} onChange={e => setStage(e.target.value)} className="w-full px-4 py-2 border rounded">
          {stages.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={mentor} onChange={e => setMentor(e.target.value)} className="w-full px-4 py-2 border rounded">
          <option value="">Select Mentor</option>
          {mentors.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div>Deadline:</div>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2 border rounded" />

        {/* Notes Section */}
        <div>
          <label className="block font-semibold mb-1">Notes</label>
          <ul className="mb-2 list-disc ml-6 text-sm">
            {notes.map((n, i) => (
              <li key={i}>
                {n.text} <span className="text-gray-400">({n.date})</span>
                <button type="button" className="ml-2 text-red-600" onClick={() => setNotes(notes.filter((_, idx) => idx !== i))}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add note"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              type="button"
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={() => {
                if (newNote.trim()) {
                  setNotes([...notes, { text: newNote, date: new Date().toLocaleDateString() }]);
                  setNewNote("");
                }
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <label className="block font-semibold mb-1">Documents</label>
          <ul className="mb-2 text-sm">
            {documents.map((d, i) => (
              <li key={i}>
                <a href={d.url} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{d.name}</a>
                <button type="button" className="ml-2 text-red-600" onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="Document Name"
              value={newDocumentName}
              onChange={e => setNewDocumentName(e.target.value)}
              className="flex-1 px-2 py-1 border rounded"
            />
            <input
              type="file"
              onChange={e => setNewDocumentFile(e.target.files[0])}
              className="flex-1 px-2 py-1 border rounded"
            />
            <button
              type="button"
              className="bg-gray-200 px-3 py-1 rounded"
              onClick={handleDocumentUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Add"}
            </button>
          </div>
        </div>
        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{candidate ? "Save" : "Add"}</button>
      </form>
    </div>
  );
};

const Candidates = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    try {
      const data = await getCandidates();
      // Parse notes and documents fields if they are JSON strings
      const parsed = data.map(c => ({
        ...c,
        notes: typeof c.notes === 'string' ? JSON.parse(c.notes) : c.notes,
        documents: typeof c.documents === 'string' ? JSON.parse(c.documents) : c.documents,
      }));
      setCandidates(parsed);
    } catch (err) {
      setError('Failed to load candidates');
    }
    setLoading(false);
  }

  async function handleSaveCandidate(candidate) {
    setError(null);
    try {
      if (candidate._id) {
        await updateCandidate(candidate._id, candidate);
      } else {
        await createCandidate(candidate);
      }
      fetchCandidates();
      setView("list");
    } catch (err) {
      setError('Failed to save candidate');
    }
  }

  async function handleDeleteCandidate(candidate) {
    if (!window.confirm(`Delete candidate '${candidate.name}'?`)) return;
    setError(null);
    try {
      await deleteCandidate(candidate._id);
      fetchCandidates();
      setView("list");
    } catch (err) {
      setError('Failed to delete candidate');
    }
  }

  if (view === "detail" && selected) return <CandidateDetail candidate={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <CandidateForm candidate={selected} onBack={() => setView("detail")} onSave={handleSaveCandidate} />;
  if (view === "add") return <CandidateForm onBack={() => setView("list")} onSave={handleSaveCandidate} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <CandidateList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} candidates={candidates} onDelete={handleDeleteCandidate} />
      {loading && <Loader />}
    </>
  );
};

export default Candidates;
