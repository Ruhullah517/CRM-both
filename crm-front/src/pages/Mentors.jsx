import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

// Mocked candidate list for assignment UI
const allCandidates = [
  { id: 1, name: 'Alice Johnson', mentor: 'Angela Foster' },
  { id: 2, name: 'Bob Smith', mentor: 'David Mensah' },
  { id: 3, name: 'Sam Brown', mentor: '' },
  { id: 4, name: 'Lisa Green', mentor: '' },
];

const initialMentors = [
  {
    id: 1,
    name: 'Angela Foster',
    email: 'angela@bfca.org',
    phone: '07700 900123',
    skills: ['Trauma', 'Safeguarding'],
    status: 'Active',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    mentees: [1, 4], // candidate IDs
  },
  {
    id: 2,
    name: 'David Mensah',
    email: 'david@bfca.org',
    phone: '07700 900456',
    skills: ['Education', 'Behaviour'],
    status: 'Inactive',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mentees: [2],
  },
];

const statusColors = {
  Active: 'bg-green-100 text-[#2EAB2C]',
  Inactive: 'bg-gray-100 text-gray-700',
  'On Leave': 'bg-yellow-100 text-yellow-800',
};

export default function Mentors() {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const [mentors, setMentors] = useState(initialMentors);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', email: '', phone: '', skills: '', status: 'Active', avatar: '', mentees: [] });
  const [showAssign, setShowAssign] = useState(false);
  const [assignMentees, setAssignMentees] = useState([]); // candidate IDs
  const [candidates, setCandidates] = useState(allCandidates);

  function openAdd() {
    setForm({ id: null, name: '', email: '', phone: '', skills: '', status: 'Active', avatar: '', mentees: [] });
    setShowForm(true);
  }
  function openEdit(m) {
    setForm({ ...m, skills: m.skills.join(', ') });
    setShowForm(true);
  }
  function openDetail(m) {
    setShowDetail(m);
  }
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleFormSubmit(e) {
    e.preventDefault();
    const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (form.id) {
      setMentors(ms => ms.map(m => m.id === form.id ? { ...form, skills: skillsArr, mentees: m.mentees } : m));
    } else {
      setMentors(ms => [...ms, { ...form, id: Date.now(), skills: skillsArr, avatar: `https://randomuser.me/api/portraits/lego/${Math.floor(Math.random()*10)}.jpg`, mentees: [] }]);
    }
    setShowForm(false);
  }
  function handleDelete(id) {
    if (window.confirm('Delete this mentor?')) {
      setMentors(ms => ms.filter(m => m.id !== id));
    }
  }

  // Assignment UI logic
  function openAssignMentees(mentor) {
    setShowDetail(mentor);
    setAssignMentees(mentor.mentees);
    setShowAssign(true);
  }
  function handleAssignChange(id) {
    setAssignMentees((prev) =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  }
  function handleAssignSave() {
    // Update mentor's mentees
    setMentors(ms => ms.map(m =>
      m.id === showDetail.id ? { ...m, mentees: assignMentees } : m
    ));
    // Update candidates' mentor field
    setCandidates(cs =>
      cs.map(c => {
        if (assignMentees.includes(c.id)) {
          // Assign this candidate to this mentor
          return { ...c, mentor: showDetail.name };
        } else if (c.mentor === showDetail.name) {
          // Remove this mentor if unassigned
          return { ...c, mentor: '' };
        }
        return c;
      })
    );
    setShowAssign(false);
  }

  function getMenteeNames(mentor) {
    return mentor.mentees
      .map(id => candidates.find(c => c.id === id)?.name)
      .filter(Boolean);
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6">Mentor Management</h1>
      {isAdminOrStaff && (
        <button
          className="mb-4 bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-800 shadow flex items-center gap-2"
          onClick={openAdd}
        >
          <PlusIcon className="w-5 h-5" /> Add Mentor
        </button>
      )}
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr className="bg-green-50">
            <th className="px-4 py-2 text-left font-semibold text-green-900">Avatar</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Name</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Email</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Phone</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Skills</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Status</th>
            <th className="px-4 py-2 text-left font-semibold text-green-900">Mentees</th>
            {isAdminOrStaff && <th className="px-4 py-2 text-left font-semibold text-green-900">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {mentors.map((m) => (
            <tr key={m.id} className="border-t hover:bg-green-50 transition">
              <td className="px-4 py-2"><img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full" /></td>
              <td className="px-4 py-2 font-semibold cursor-pointer hover:underline" onClick={() => openDetail(m)}>{m.name}</td>
              <td className="px-4 py-2 text-[12px]">{m.email}</td>
              <td className="px-4 py-2 text-[12px]">{m.phone}</td>
              <td className="px-4 py-2">
                {m.skills.map(s => <span key={s} className="inline-block bg-green-100 text-[#2EAB2C] text-xs px-2 py-1 rounded mr-1 mb-1">{s}</span>)}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[m.status]}`}>{m.status}</span>
              </td>
              <td className="px-4 py-2 text-xs text-gray-700">
                {getMenteeNames(m).length ? getMenteeNames(m).join(', ') : <span className="text-gray-400">None</span>}
              </td>
              {isAdminOrStaff && (
                <td className="px-4 py-2 text-[12px]">
                  <button className="text-[#2EAB2C]  hover:underline flex items-center gap-1 mr-2" onClick={() => openEdit(m)}>
                    <PencilSquareIcon className="w-5 h-5" /> Edit
                  </button>
                  <button className="text-red-600 hover:underline flex items-center gap-1 mr-2" onClick={() => handleDelete(m.id)}>
                    <TrashIcon className="w-5 h-5" /> Delete
                  </button>
                  <button className="text-blue-700 hover:underline flex items-center gap-1" onClick={() => openAssignMentees(m)}>
                    <UserPlusIcon className="w-5 h-5" /> Assign Mentees
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowForm(false)}><XMarkIcon className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-4">{form.id ? 'Edit' : 'Add'} Mentor</h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded"
                required
                type="email"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="Phone"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                name="skills"
                value={form.skills}
                onChange={handleFormChange}
                placeholder="Skills (comma separated)"
                className="w-full px-4 py-2 border rounded"
              />
              <select name="status" value={form.status} onChange={handleFormChange} className="w-full px-4 py-2 border rounded">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
              <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 shadow">{form.id ? 'Update' : 'Add'} Mentor</button>
            </form>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowDetail(null)}><XMarkIcon className="w-5 h-5" /></button>
            <div className="flex items-center gap-4 mb-4">
              <img src={showDetail.avatar} alt={showDetail.name} className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{showDetail.name}</h2>
                <div className={`px-2 py-1 rounded text-xs font-semibold inline-block mt-1 ${statusColors[showDetail.status]}`}>{showDetail.status}</div>
              </div>
            </div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {showDetail.email}</div>
            <div className="mb-2"><span className="font-semibold">Phone:</span> {showDetail.phone}</div>
            <div className="mb-2"><span className="font-semibold">Skills:</span> {showDetail.skills.map(s => <span key={s} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">{s}</span>)}</div>
            <div className="mb-2"><span className="font-semibold">Mentees:</span> {getMenteeNames(showDetail).length ? getMenteeNames(showDetail).join(', ') : <span className="text-gray-400">None</span>}</div>
            {isAdminOrStaff && (
              <button className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 shadow" onClick={() => openAssignMentees(showDetail)}>
                <span className="mr-2">🔗</span>Assign Mentees
              </button>
            )}
          </div>
        </div>
      )}
      {/* Assignment Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowAssign(false)}><XMarkIcon className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-4">Assign Mentees to {showDetail.name}</h2>
            <form onSubmit={e => { e.preventDefault(); handleAssignSave(); }}>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {candidates.map(c => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignMentees.includes(c.id)}
                      onChange={() => handleAssignChange(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 shadow">Save Assignments</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 