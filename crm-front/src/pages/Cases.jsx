import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { mockSupportCases } from "../utils/mockData";

const initialCases = [
  {
    id: 1,
    subject: 'Support for Foster Carer',
    status: 'Open',
    caseworker: 'Sarah Brown',
    individual: 'Alice Johnson',
    activityLog: [
      { action: 'Case created', timestamp: '2024-06-01' },
      { action: 'Initial meeting', timestamp: '2024-06-03' },
    ],
    files: [],
    followUp: '2024-07-01',
  },
  {
    id: 2,
    subject: 'Child Advocacy',
    status: 'In Progress',
    caseworker: 'Mike Green',
    individual: 'Bob Smith',
    activityLog: [
      { action: 'Case created', timestamp: '2024-06-10' },
    ],
    files: [],
    followUp: '2024-07-15',
  },
];

const statuses = ['Open', 'In Progress', 'Closed'];
const caseworkers = ['Sarah Brown', 'Mike Green', 'Jane Lee'];
const individuals = ['Alice Johnson', 'Bob Smith'];

const statusColors = {
  active: 'bg-green-100 text-[#2EAB2C]',
  open: 'bg-green-100 text-[#2EAB2C]',
  'in progress': 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
};

const CaseList = ({ onSelect, onAdd }) => {
  const [search, setSearch] = useState("");
  const filtered = mockSupportCases.filter(c => c.person.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search cases..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Case</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Person</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Caseworker</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.person}</td>
                <td className="px-4 py-2">{c.type}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.assignedCaseworker}</td>
                <td className="px-4 py-2">{c.startDate}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CaseDetail = ({ caseItem, onBack, onEdit }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-2">{caseItem.person}</h2>
    <div className="mb-2"><span className="font-semibold">Type:</span> {caseItem.type}</div>
    <div className="mb-2"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[caseItem.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{caseItem.status}</span></div>
    <div className="mb-2"><span className="font-semibold">Caseworker:</span> {caseItem.assignedCaseworker}</div>
    <div className="mb-2"><span className="font-semibold">Start Date:</span> {caseItem.startDate}</div>
    <h3 className="font-semibold mt-4 mb-1">Activity Log</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{caseItem.activity.map(a => <li key={a.id}>{a.action} <span className="text-gray-400">({a.date})</span></li>)}</ul>
    <h3 className="font-semibold mb-1">Uploads</h3>
    <ul className="mb-2 text-sm">{caseItem.uploads.map(u => <li key={u.id}><a href={u.url} className="text-blue-700 hover:underline">{u.name}</a></li>)}</ul>
    <h3 className="font-semibold mb-1">Reminders</h3>
    <ul className="mb-2 text-sm">{caseItem.reminders.map(r => <li key={r.id}>{r.text} <span className="text-gray-400">({r.date})</span></li>)}</ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const CaseForm = ({ caseItem, onBack }) => (
  <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-4">{caseItem ? "Edit" : "Add"} Case</h2>
    {/* Placeholder form fields */}
    <form className="space-y-4">
      <input placeholder="Person" defaultValue={caseItem?.person} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Type" defaultValue={caseItem?.type} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Caseworker" defaultValue={caseItem?.assignedCaseworker} className="w-full px-4 py-2 border rounded" />
      <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{caseItem ? "Save" : "Add"}</button>
    </form>
  </div>
);

const Cases = () => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  if (view === "detail" && selected) return <CaseDetail caseItem={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <CaseForm caseItem={selected} onBack={() => { setView("detail"); }} />;
  if (view === "add") return <CaseForm onBack={() => setView("list")} />;
  return <CaseList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} />;
};

export default Cases;
