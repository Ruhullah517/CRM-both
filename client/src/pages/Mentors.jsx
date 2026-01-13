import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  AcademicCapIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getMentors, createMentor, updateMentor, deleteMentor } from '../services/mentors';
import Loader from '../components/Loader';

const statusColors = {
  Active: 'bg-green-100 text-[#2EAB2C]',
  Inactive: 'bg-gray-100 text-gray-700',
  'On Leave': 'bg-yellow-100 text-yellow-800',
};

export default function Mentors() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrStaff = user?.user?.role === 'admin' || user?.user?.role === 'staff' || user?.role === 'admin' || user?.role === 'staff';
  const [mentors, setMentors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    _id: null, 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    skills: '', 
    specialization: '',
    qualifications: '',
    status: 'Active',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMentors();
      setMentors(data || []);
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError('Failed to load mentors');
    }
    setLoading(false);
  }

  function openAdd() {
    setForm({ 
      _id: null, 
      name: '', 
      email: '', 
      phone: '', 
      address: '',
      skills: '', 
      specialization: '',
      qualifications: '',
      status: 'Active',
      notes: ''
    });
    setShowForm(true);
  }
  
  function handleView(m) {
    navigate(`/mentors/${m._id}`);
  }
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  
  async function handleFormSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const mentorData = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      
      if (form._id) {
        await updateMentor(form._id, mentorData);
      } else {
        await createMentor(mentorData);
      }
      await fetchMentors();
      setShowForm(false);
      alert('Mentor saved successfully!');
    } catch (err) {
      console.error('Error saving mentor:', err);
      setError('Failed to save mentor');
      alert('Failed to save mentor. Please try again.');
    }
    setSaving(false);
  }
  
  async function handleDelete(_id, name) {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    setDeleting(_id);
    try {
      await deleteMentor(_id);
      await fetchMentors();
      alert('Mentor deleted successfully!');
    } catch (err) {
      console.error('Error deleting mentor:', err);
      setError('Failed to delete mentor');
      alert('Failed to delete mentor. Please try again.');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-4 md:p-6 min-h-full">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <AcademicCapIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
          Mentor Management
        </h1>
        <p className="text-gray-600 mt-2">Manage mentors and track their activities and assignments</p>
      </div>
      {isAdminOrStaff && (
        <button
          className="mb-4 bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-800 shadow flex items-center gap-2"
          onClick={openAdd}
        >
          <PlusIcon className="w-5 h-5" /> Add Mentor
        </button>
      )}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {/* Table for desktop */}
      <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                {isAdminOrStaff && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mentors.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrStaff ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    No mentors found
                  </td>
                </tr>
              ) : (
                mentors.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => handleView(m)}>
                        {m.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(m.skills) ? m.skills : []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {s}
                          </span>
                        ))}
                        {Array.isArray(m.skills) && m.skills.length > 2 && (
                          <span className="text-xs text-gray-500">+{m.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[m.status] || statusColors['Inactive']}`}>
                        {m.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.specialization || '-'}</td>
                    {isAdminOrStaff && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleView(m)}
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(m._id, m.name)}
                            disabled={deleting === m._id}
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card view for mobile and tablet */}
      <div className="lg:hidden space-y-4 mb-6">
        {mentors.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No mentors found</div>
        ) : (
          mentors.map((m) => (
            <div key={m._id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 justify-between">
                <div>
                  <div className="font-semibold text-base">{m.name}</div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold inline-block mt-1 ${statusColors[m.status] || statusColors['Inactive']}`}>
                    {m.status || 'Active'}
                  </div>
                </div>
                {isAdminOrStaff && (
                  <div className="flex gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleView(m)}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(m._id, m.name)}
                      disabled={deleting === m._id}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {m.email || '-'}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Phone:</span> {m.phone || '-'}
              </div>
              {m.specialization && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Specialization:</span> {m.specialization}
                </div>
              )}
              <div className="text-sm text-gray-700 flex flex-wrap gap-1">
                <span className="font-semibold">Skills:</span>
                {(Array.isArray(m.skills) ? m.skills : []).slice(0, 3).map((s, idx) => (
                  <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      )}
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowForm(false)}><XMarkIcon className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-4">{form._id ? 'Edit' : 'Add'} Mentor</h2>
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
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="Address"
                className="w-full px-4 py-2 border rounded"
              />
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleFormChange}
                placeholder="Specialization"
                className="w-full px-4 py-2 border rounded"
              />
              <input
                name="qualifications"
                value={form.qualifications}
                onChange={handleFormChange}
                placeholder="Qualifications"
                className="w-full px-4 py-2 border rounded"
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
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Notes"
                className="w-full px-4 py-2 border rounded"
                rows={3}
              />
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-2 rounded shadow ${saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#2EAB2C] text-white hover:bg-green-800'
                  }`}
              >
                {saving ? (form._id ? 'Updating...' : 'Adding...') : (form._id ? 'Update' : 'Add')} Mentor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 