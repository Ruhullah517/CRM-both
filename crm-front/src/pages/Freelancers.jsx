import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { mockFreelancers } from "../utils/mockData";

const initialFreelancers = [
  {
    id: 1,
    name: 'Anna White',
    role: 'Trainer',
    status: 'Active',
    availability: 'Available',
    email: 'anna@example.com',
    skills: 'Training, Mentoring',
    complianceDocs: ['dbs.pdf', 'id.pdf'],
    assignments: ['Case 1'],
  },
  {
    id: 2,
    name: 'James Black',
    role: 'Mentor',
    status: 'Inactive',
    availability: 'Unavailable',
    email: 'james@example.com',
    skills: 'Mentoring',
    complianceDocs: [],
    assignments: [],
  },
];

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

const FreelancerList = ({ onSelect, onAdd }) => {
  const [search, setSearch] = useState("");
  const filtered = mockFreelancers.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
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
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{f.name}</td>
                <td className="px-4 py-2">{f.role}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${availabilityColors[f.availability?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{f.availability}</span></td>
                <td className="px-4 py-2">{f.contractDate}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(f)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
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
    <div className="mb-2"><span className="font-semibold">Contract Date:</span> {freelancer.contractDate}</div>
    <h3 className="font-semibold mt-4 mb-1">Assignments</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{freelancer.assignments.map((a, i) => <li key={i}>{a}</li>)}</ul>
    <h3 className="font-semibold mb-1">Uploads</h3>
    <ul className="mb-2 text-sm">{freelancer.uploads.map(u => <li key={u.id}><a href={u.url} className="text-blue-700 hover:underline">{u.name}</a></li>)}</ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const FreelancerForm = ({ freelancer, onBack }) => (
  <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-4">{freelancer ? "Edit" : "Add"} Freelancer</h2>
    {/* Placeholder form fields */}
    <form className="space-y-4">
      <input placeholder="Name" defaultValue={freelancer?.name} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Role" defaultValue={freelancer?.role} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Availability" defaultValue={freelancer?.availability} className="w-full px-4 py-2 border rounded" />
      <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{freelancer ? "Save" : "Add"}</button>
    </form>
  </div>
);

const Freelancers = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isFreelancer = user?.role === 'freelancer';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [freelancers, setFreelancers] = useState(initialFreelancers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null, name: '', role: roles[0], status: statuses[0], availability: availabilities[0], email: '', skills: '', complianceDocs: [], assignments: []
  });

  function openAdd() {
    setForm({ id: null, name: '', role: roles[0], status: statuses[0], availability: availabilities[0], email: '', skills: '', complianceDocs: [], assignments: [] });
    setShowForm(true);
  }
  function openEdit(f) {
    setForm(f);
    setShowForm(true);
  }
  function handleFormChange(e) {
    const { name, value, files } = e.target;
    if (name === 'complianceDocs') {
      setForm(f => ({ ...f, complianceDocs: files ? Array.from(files).map(f => f.name) : [] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    if (form.id) {
      setFreelancers(fs => fs.map(f => f.id === form.id ? { ...form } : f));
    } else {
      setFreelancers(fs => [...fs, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
  }

  // Freelancers can only edit their own profile
  const canEdit = (freelancer) => {
    if (isAdminOrStaff) return true;
    if (isFreelancer && user.email === freelancer.email) return true;
    return false;
  };

  if (view === "detail" && selected) return <FreelancerDetail freelancer={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <FreelancerForm freelancer={selected} onBack={() => { setView("detail"); }} />;
  if (view === "add") return <FreelancerForm onBack={() => setView("list")} />;
  return <FreelancerList onSelect={f => { setSelected(f); setView("detail"); }} onAdd={() => setView("add")} />;
};

export default Freelancers;
