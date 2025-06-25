import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { mockCandidates } from "../utils/mockData";

const initialCandidates = [
  {
    id: 1,
    name: 'Alice Johnson',
    stage: 'Assessment',
    status: 'Active',
    mentor: 'John Doe',
    email: 'alice@example.com',
    notes: 'Strong candidate.',
    documents: [],
    deadline: '2024-07-01',
  },
  {
    id: 2,
    name: 'Bob Smith',
    stage: 'Application',
    status: 'New',
    mentor: 'Jane Lee',
    email: 'bob@example.com',
    notes: '',
    documents: [],
    deadline: '2024-07-10',
  },
];

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

const CandidateList = ({ onSelect, onAdd, candidates }) => {
  const [search, setSearch] = useState("");
  const filtered = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Candidate</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Stage</th>
              <th className="px-4 py-2">Mentor</th>
              <th className="px-4 py-2">Deadline</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status]}`}>{c.status}</span></td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${stageColors[c.stage]}`}>{c.stage}</span></td>
                <td className="px-4 py-2">{c.mentor}</td>
                <td className="px-4 py-2">{c.deadline}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="mb-2"><span className="font-semibold">Deadline:</span> {candidate.deadline}</div>
    <h3 className="font-semibold mt-4 mb-1">Notes</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{candidate.notes.map(n => <li key={n.id}>{n.text} <span className="text-gray-400">({n.date})</span></li>)}</ul>
    <h3 className="font-semibold mb-1">Documents</h3>
    <ul className="mb-2 text-sm">{candidate.documents.map(d => <li key={d.id}><a href={d.url} className="text-blue-700 hover:underline">{d.name}</a></li>)}</ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const CandidateForm = ({ candidate, onBack, onSave }) => {
  const [name, setName] = useState(candidate?.name || "");
  const [mentor, setMentor] = useState(candidate?.mentor || "");
  const [deadline, setDeadline] = useState(candidate?.deadline || "");
  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...candidate,
      name,
      mentor,
      deadline,
      id: candidate?.id || Date.now(),
      status: candidate?.status || "New",
      stage: candidate?.stage || "Inquiry",
      notes: candidate?.notes || [],
      documents: candidate?.documents || [],
      email: candidate?.email || "",
    });
  }
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{candidate ? "Edit" : "Add"} Candidate</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input placeholder="Mentor" value={mentor} onChange={e => setMentor(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-2 border rounded" />
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
  const [candidates, setCandidates] = useState(mockCandidates);

  function handleSaveCandidate(candidate) {
    setCandidates(prev => {
      const exists = prev.some(c => c.id === candidate.id);
      if (exists) {
        // Update existing candidate
        return prev.map(c => c.id === candidate.id ? candidate : c);
      } else {
        // Add new candidate
        return [...prev, candidate];
      }
    });
    setView("list");
  }

  if (view === "detail" && selected) return <CandidateDetail candidate={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <CandidateForm candidate={selected} onBack={() => setView("detail")} onSave={handleSaveCandidate} />;
  if (view === "add") return <CandidateForm onBack={() => setView("list")} onSave={handleSaveCandidate} />;
  return <CandidateList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} candidates={candidates} />;
};

export default Candidates;
