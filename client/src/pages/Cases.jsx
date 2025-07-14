import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getCases, createCase, updateCase, deleteCase, uploadCaseFile } from '../services/cases';
import { formatDate } from '../utils/dateUtils';

const statuses = ['Open', 'In Progress', 'Closed'];
const caseworkers = ['Sarah Brown', 'Mike Green', 'Jane Lee'];
const individuals = ['Alice Johnson', 'Bob Smith'];
const caseTypes = ['Support', 'Advocacy', 'Training', 'Other'];

const statusColors = {
  active: 'bg-green-100 text-[#2EAB2C]',
  open: 'bg-green-100 text-[#2EAB2C]',
  'in progress': 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
};

const CaseList = ({ onSelect, onAdd, cases, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = cases.filter(c => c.person.toLowerCase().includes(search.toLowerCase()));
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
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.person}</td>
                <td className="px-4 py-2">{c.type}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.assignedCaseworker}</td>
                <td className="px-4 py-2">{formatDate(c.startDate)}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
                <td className="px-4 py-2"><button onClick={() => onDelete(c)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button></td>
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
    <div className="mb-2"><span className="font-semibold">Start Date:</span> {formatDate(caseItem.startDate)}</div>
    <h3 className="font-semibold mt-4 mb-1">Activity Log</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{(caseItem.activity || []).map((a, i) => <li key={i}>{a.action} <span className="text-gray-400">({formatDate(a.date)})</span></li>)}</ul>
    <h3 className="font-semibold mb-1">Uploads</h3>
    <ul className="mb-2 text-sm">{(caseItem.uploads || []).map((u, i) => <li key={i}><a href={u.url} className="text-blue-700 hover:underline">{u.name}</a></li>)}</ul>
    <h3 className="font-semibold mb-1">Reminders</h3>
    <ul className="mb-2 text-sm">{(caseItem.reminders || []).map((r, i) => <li key={i}>{r.text} <span className="text-gray-400">({formatDate(r.date)})</span></li>)}</ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const CaseForm = ({ caseItem, onBack, onSave }) => {
  const [person, setPerson] = useState(caseItem?.person || "");
  const [type, setType] = useState(caseItem?.type || "");
  const [assignedCaseworker, setAssignedCaseworker] = useState(caseItem?.assignedCaseworker || "");
  const [startDate, setStartDate] = useState(caseItem?.startDate || "");
  // New: Activity, Uploads, Reminders
  const [activity, setActivity] = useState(caseItem?.activity || []);
  const [uploads, setUploads] = useState(caseItem?.uploads || []);
  const [reminders, setReminders] = useState(caseItem?.reminders || []);
  // Temp states for adding new items
  const [newAction, setNewAction] = useState("");
  const [newActionDate, setNewActionDate] = useState("");
  const [newUploadName, setNewUploadName] = useState("");
  const [newUploadUrl, setNewUploadUrl] = useState("");
  const [newUploadFile, setNewUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [newReminderText, setNewReminderText] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...caseItem,
      person,
      type,
      assignedCaseworker,
      startDate,
      status: caseItem?.status || "Open",
      activity,
      uploads,
      reminders,
    });
  }

  // Add/Remove handlers
  const addActivity = () => {
    if (newAction && newActionDate) {
      setActivity([...activity, { action: newAction, date: newActionDate }]);
      setNewAction(""); setNewActionDate("");
    }
  };
  const removeActivity = idx => setActivity(activity.filter((_, i) => i !== idx));

  const addUpload = async () => {
    if (newUploadFile) {
      setUploading(true);
      setUploadError("");
      try {
        const result = await uploadCaseFile(newUploadFile);
        setUploads([...uploads, { name: result.name, url: result.url }]);
        setNewUploadFile(null); setNewUploadName(""); setNewUploadUrl("");
      } catch (err) {
        setUploadError("File upload failed");
      }
      setUploading(false);
    } else if (newUploadName && newUploadUrl) {
      setUploads([...uploads, { name: newUploadName, url: newUploadUrl }]);
      setNewUploadName(""); setNewUploadUrl("");
    }
  };
  const removeUpload = idx => setUploads(uploads.filter((_, i) => i !== idx));

  const addReminder = () => {
    if (newReminderText && newReminderDate) {
      setReminders([...reminders, { text: newReminderText, date: newReminderDate }]);
      setNewReminderText(""); setNewReminderDate("");
    }
  };
  const removeReminder = idx => setReminders(reminders.filter((_, i) => i !== idx));

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{caseItem ? "Edit" : "Add"} Case</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Person" value={person} onChange={e => setPerson(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-2 border rounded">
          <option value="">Select Type</option>
          {caseTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={assignedCaseworker} onChange={e => setAssignedCaseworker(e.target.value)} className="w-full px-4 py-2 border rounded">
          <option value="">Select Caseworker</option>
          {caseworkers.map(cw => (
            <option key={cw} value={cw}>{cw}</option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded" />

        {/* Activity Log Section */}
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Activity Log</div>
          <ul className="mb-2">
            {activity.map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1">
                <span>{a.action} <span className="text-gray-400">({formatDate(a.date)})</span></span>
                <button type="button" className="text-red-500 ml-2" onClick={() => removeActivity(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mb-2">
            <input placeholder="Action" value={newAction} onChange={e => setNewAction(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
            <input type="date" value={newActionDate} onChange={e => setNewActionDate(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addActivity}>Add</button>
          </div>
        </div>

        {/* Uploads Section */}
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Uploads</div>
          <ul className="mb-2">
            {uploads.map((u, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1">
                <span><a href={u.url} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{u.name}</a></span>
                <button type="button" className="text-red-500 ml-2" onClick={() => removeUpload(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex gap-2">
              <input placeholder="File Name (optional)" value={newUploadName} onChange={e => setNewUploadName(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
              <input placeholder="File URL (optional)" value={newUploadUrl} onChange={e => setNewUploadUrl(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
            </div>
            <div className="flex gap-2 items-center">
              <input type="file" onChange={e => setNewUploadFile(e.target.files[0])} className="px-2 py-1 border rounded w-1/2" />
              <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Add'}</button>
            </div>
            {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
          </div>
        </div>

        {/* Reminders Section */}
        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Reminders</div>
          <ul className="mb-2">
            {reminders.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1">
                <span>{r.text} <span className="text-gray-400">({formatDate(r.date)})</span></span>
                <button type="button" className="text-red-500 ml-2" onClick={() => removeReminder(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mb-2">
            <input placeholder="Reminder" value={newReminderText} onChange={e => setNewReminderText(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
            <input type="date" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} className="px-2 py-1 border rounded w-1/2" />
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addReminder}>Add</button>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{caseItem ? "Save" : "Add"}</button>
      </form>
    </div>
  );
};

const Cases = () => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    setLoading(true);
    try {
      const data = await getCases();
      // Parse activity, uploads, reminders fields if they are JSON strings
      const parsed = data.map(c => ({
        ...c,
        activity: typeof c.activity === 'string' ? JSON.parse(c.activity) : c.activity,
        uploads: typeof c.uploads === 'string' ? JSON.parse(c.uploads) : c.uploads,
        reminders: typeof c.reminders === 'string' ? JSON.parse(c.reminders) : c.reminders,
      }));
      setCases(parsed);
    } catch (err) {
      setError('Failed to load cases');
    }
    setLoading(false);
  }

  async function handleSaveCase(caseData) {
    setError(null);
    try {
      if (caseData._id) {
        await updateCase(caseData._id, caseData);
      } else {
        await createCase(caseData);
      }
      fetchCases();
      setView("list");
    } catch (err) {
      setError('Failed to save case');
    }
  }

  async function handleDeleteCase(caseItem) {
    if (!window.confirm(`Delete case for '${caseItem.person}'?`)) return;
    setError(null);
    try {
      await deleteCase(caseItem._id);
      fetchCases();
      setView("list");
    } catch (err) {
      setError('Failed to delete case');
    }
  }

  if (view === "detail" && selected) return <CaseDetail caseItem={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <CaseForm caseItem={selected} onBack={() => setView("detail")} onSave={handleSaveCase} />;
  if (view === "add") return <CaseForm onBack={() => setView("list")} onSave={handleSaveCase} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <CaseList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} cases={cases} onDelete={handleDeleteCase} />
      {loading && <div className="text-center py-4">Loading...</div>}
    </>
  );
};

export default Cases;
