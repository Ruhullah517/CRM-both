import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContractTemplates, createContractTemplate, updateContractTemplate } from '../services/contractTemplates';
import Loader from '../components/Loader';

const roles = ['Trainer', 'Mentor'];

export default function ContractTemplates() {
  const { user } = useAuth();
  const isAdminOrStaff = user.user?.role === 'admin' || user?.role === 'staff';
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', role: roles[0], body: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    setError(null);
    try {
      const data = await getContractTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
    }
    setLoading(false);
  }

  function openAdd() {
    setForm({ id: null, name: '', role: roles[0], body: '' });
    setShowForm(true);
  }
  function openEdit(t) {
    setForm(t);
    setShowForm(true);
  }
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  async function handleFormSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) {
        await updateContractTemplate(form.id, form);
      } else {
        await createContractTemplate(form);
      }
      fetchTemplates();
      setShowForm(false);
    } catch (err) {
      setError('Failed to save template');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl w-full mx-auto mt-6 bg-white rounded shadow p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Contract Templates</h1>
      {isAdminOrStaff && (
        <button
          className="mb-4 bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-800 shadow flex items-center gap-2"
          onClick={openAdd}
        >
          <PlusIcon className="w-5 h-5" /> Add Template
        </button>
      )}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto rounded">
        <table className="min-w-full bg-white rounded shadow mb-8">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2 text-left font-semibold text-green-900">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-green-900">Role</th>
              <th className="px-4 py-2 text-left font-semibold text-green-900">Preview</th>
              {isAdminOrStaff && <th className="px-4 py-2 text-left font-semibold text-green-900">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{t.name}</td>
                <td className="px-4 py-2">{t.role}</td>
                <td className="px-4 py-2 text-gray-600 text-sm max-w-xs truncate">{t.body.slice(0, 60)}...</td>
                {isAdminOrStaff && (
                  <td className="px-4 py-2">
                    <button className="text-[#2EAB2C] hover:underline flex items-center gap-1" onClick={() => openEdit(t)}>
                      <PencilSquareIcon className="w-5 h-5" /> Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <Loader />}
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded shadow-lg p-4 sm:p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowForm(false)}><XMarkIcon className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-4">{form.id ? 'Edit' : 'Add'} Contract Template</h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Template Name"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <select name="role" value={form.role} onChange={handleFormChange} className="w-full px-4 py-2 border rounded">
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <textarea
                name="body"
                value={form.body}
                onChange={handleFormChange}
                placeholder="Contract Body (use {{name}}, {{rate}}, etc. for placeholders)"
                className="w-full px-4 py-2 border rounded min-h-[120px]"
                required
              />
              <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 shadow" disabled={saving}>{form.id ? 'Update' : 'Add'} Template</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 