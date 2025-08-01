import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const initialTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to BFCA!',
    body: 'Dear {{name}},\nWelcome to the Black Foster Carers Alliance. We are excited to have you on board!',
  },
  {
    id: 2,
    name: 'Training Reminder',
    subject: 'Upcoming Training Event',
    body: 'Dear {{name}},\nThis is a reminder for your upcoming training event on {{date}}.',
  },
];

export default function EmailTemplates() {
  const { user } = useAuth();
  const isAdminOrStaff = user.user?.role === 'admin' || user?.role === 'staff';
  const [templates, setTemplates] = useState(initialTemplates);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', subject: '', body: '' });

  function openAdd() {
    setForm({ id: null, name: '', subject: '', body: '' });
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
  function handleFormSubmit(e) {
    e.preventDefault();
    if (form.id) {
      setTemplates(ts => ts.map(t => t.id === form.id ? { ...form } : t));
    } else {
      setTemplates(ts => [...ts, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6">Email Templates</h1>
      {isAdminOrStaff && (
        <button
          className="mb-4 bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-800 shadow flex items-center gap-2"
          onClick={openAdd}
        >
          <PlusIcon className="w-5 h-5" /> Add Template
        </button>
      )}
      {/* Table for sm and up */}
      <div className="hidden sm:block">
        <table className="min-w-full bg-white rounded shadow mb-8">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2 text-left font-semibold text-green-900">Name</th>
              <th className="px-4 py-2 text-left font-semibold text-green-900">Subject</th>
              <th className="px-4 py-2 text-left font-semibold text-green-900">Preview</th>
              {isAdminOrStaff && <th className="px-4 py-2 text-left font-semibold text-green-900">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{t.name}</td>
                <td className="px-4 py-2">{t.subject}</td>
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

      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4 mb-8">
        {templates.map((t) => (
          <div key={t.id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{t.name}</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Subject:</span> {t.subject}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Preview:</span>{" "}
              <span className="text-gray-600">{t.body.slice(0, 60)}...</span>
            </div>
            {isAdminOrStaff && (
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 px-3 py-2 rounded bg-black text-white font-semibold hover:bg-green-800 flex items-center justify-center gap-2"
                  onClick={() => openEdit(t)}
                >
                  <PencilSquareIcon className="w-5 h-5" /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowForm(false)}>✕</button>
            <h2 className="text-xl font-bold mb-4">{form.id ? 'Edit' : 'Add'} Email Template</h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Template Name"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <input
                name="subject"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="Subject"
                className="w-full px-4 py-2 border rounded"
                required
              />
              <textarea
                name="body"
                value={form.body}
                onChange={handleFormChange}
                placeholder="Email Body (use {{name}}, {{date}}, etc. for placeholders)"
                className="w-full px-4 py-2 border rounded min-h-[120px]"
                required
              />
              <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 shadow">{form.id ? 'Update' : 'Add'} Template</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 