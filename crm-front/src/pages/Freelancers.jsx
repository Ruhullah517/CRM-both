import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getFreelancers, createFreelancer, updateFreelancer, deleteFreelancer } from '../services/freelancers';
import { formatDate } from '../utils/dateUtils';

const roles = ['Trainer', 'Mentor'];
const statuses = ['Active', 'Inactive'];
const availabilities = ['Available', 'Unavailable'];

const statusColors = {
  Active: 'bg-green-100 text-[#2EAB2C]',
  Inactive: 'bg-gray-200 text-gray-800',
};
const availabilityColors = {
  available: 'bg-green-100 text-[#2EAB2C]',
  unavailable: 'bg-yellow-100 text-yellow-800',
};

const FreelancerList = ({ onSelect, onAdd, freelancers, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = freelancers.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search freelancers..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Freelancer</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Availability</th>
              <th className="px-4 py-2">Contract Date</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{f.name}</td>
                <td className="px-4 py-2">{f.role}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${availabilityColors[f.availability?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{f.availability}</span></td>
                <td className="px-4 py-2">{formatDate(f.contractDate)}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(f)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
                <td className="px-4 py-2"><button onClick={() => onDelete(f)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FreelancerDetail = ({ freelancer, onBack, onEdit }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-2">{freelancer.name}</h2>
    <div className="mb-2"><span className="font-semibold">Role:</span> {freelancer.role}</div>
    <div className="mb-2"><span className="font-semibold">Availability:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${availabilityColors[freelancer.availability?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{freelancer.availability}</span></div>
    <div className="mb-2"><span className="font-semibold">Contract Date:</span> {formatDate(freelancer.contractDate)}</div>
    <h3 className="font-semibold mt-4 mb-1">Assignments</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{(freelancer.assignments || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
    <h3 className="font-semibold mb-1">Uploads</h3>
    <ul className="mb-2 text-sm">{(freelancer.uploads || []).map(u => <li key={u.id}><a href={u.url} className="text-blue-700 hover:underline">{u.name}</a></li>)}</ul>
    <div className="flex gap-2 mt-4">
      <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
    </div>
  </div>
);

function formatDateForInput(date) {
  if (!date) return '';
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Try to parse and format
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}

const FreelancerForm = ({ freelancer, onBack, onSave, loading }) => {
  const [form, setForm] = useState({
    name: freelancer?.name || '',
    role: freelancer?.role || roles[0],
    availability: freelancer?.availability || availabilities[0],
    contractDate: formatDateForInput(freelancer?.contractDate),
    assignments: freelancer?.assignments || [],
    uploads: freelancer?.uploads || [],
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...freelancer, ...form });
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{freelancer ? "Edit" : "Add"} Freelancer</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2 border rounded">
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select name="availability" value={form.availability} onChange={handleChange} className="w-full px-4 py-2 border rounded">
          {availabilities.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input name="contractDate" type="date" value={form.contractDate} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold" disabled={loading}>{loading ? 'Saving...' : (freelancer ? "Save" : "Add")}</button>
      </form>
    </div>
  );
};

const Freelancers = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isFreelancer = user?.role === 'freelancer';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  async function fetchFreelancers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getFreelancers();
      // Parse assignments and uploads if needed
      const parsed = data.map(f => ({
        ...f,
        assignments: typeof f.assignments === 'string' ? JSON.parse(f.assignments) : (f.assignments || []),
        uploads: typeof f.uploads === 'string' ? JSON.parse(f.uploads) : (f.uploads || []),
      }));
      setFreelancers(parsed);
    } catch (err) {
      setError('Failed to load freelancers');
    }
    setLoading(false);
  }

  async function handleSaveFreelancer(freelancer) {
    setSaving(true);
    setError(null);
    try {
      if (freelancer._id) {
        await updateFreelancer(freelancer._id, freelancer);
      } else {
        await createFreelancer(freelancer);
      }
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to save freelancer');
    }
    setSaving(false);
  }

  async function handleDeleteFreelancer(freelancer) {
    if (!window.confirm(`Delete freelancer '${freelancer.name}'?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteFreelancer(freelancer._id);
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to delete freelancer');
    }
    setSaving(false);
  }

  if (view === "detail" && selected) return <FreelancerDetail freelancer={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <FreelancerForm freelancer={selected} onBack={() => setView("detail")} onSave={handleSaveFreelancer} loading={saving} />;
  if (view === "add") return <FreelancerForm onBack={() => setView("list")} onSave={handleSaveFreelancer} loading={saving} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <FreelancerList onSelect={f => { setSelected(f); setView("detail"); }} onAdd={() => setView("add")} freelancers={freelancers} onDelete={handleDeleteFreelancer} />
      {loading && <div className="text-center py-4">Loading...</div>}
    </>
  );
};

export default Freelancers;
