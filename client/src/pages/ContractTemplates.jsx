import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContractTemplates, createContractTemplate, updateContractTemplate } from '../services/contractTemplates';
import Loader from '../components/Loader';

const types = ['company', 'freelancer', 'mentor', 'delivery'];
const recommendedPlaceholders = [
  '{{client_name}}', '{{client_organization}}', '{{client_email}}', '{{client_phone}}', '{{agreement_date}}',
  '{{training_title}}', '{{training_format}}', '{{training_location}}', '{{training_date}}', '{{training_duration}}',
  '{{max_participants_online}}', '{{max_participants_in_person}}', '{{course_fee}}', '{{deposit_amount}}',
  '{{final_balance_due_date}}', '{{payment_reference}}', '{{client_sign_name}}', '{{client_sign_position}}',
  '{{client_sign_date}}', '{{bfca_sign_date}}', '{{facilitator_name}}', '{{facilitator_address}}', '{{effective_date}}',
  '{{half_day_rate}}', '{{full_day_rate}}', '{{session_details}}', '{{participant_numbers}}', '{{pre_approved_expenses}}',
  '{{invoice_due_date}}', '{{nda_attached}}', '{{termination_notice_period}}', '{{bfca_sign_name}}', '{{bfca_sign_position}}',
  '{{facilitator_sign_name}}', '{{facilitator_sign_position}}', '{{facilitator_sign_date}}'
];

const placeholdersByType = {
  company: [
    '{{client_name}}', '{{client_organization}}', '{{client_email}}', '{{client_phone}}', '{{agreement_date}}',
    '{{training_title}}', '{{training_format}}', '{{training_location}}', '{{training_date}}', '{{training_duration}}',
    '{{max_participants_online}}', '{{max_participants_in_person}}', '{{course_fee}}', '{{deposit_amount}}',
    '{{final_balance_due_date}}', '{{payment_reference}}', '{{client_sign_name}}', '{{client_sign_position}}',
    '{{client_sign_date}}', '{{bfca_sign_date}}'
  ],
  freelancer: [
    '{{facilitator_name}}', '{{facilitator_address}}', '{{effective_date}}', '{{half_day_rate}}', '{{full_day_rate}}',
    '{{session_details}}', '{{participant_numbers}}', '{{pre_approved_expenses}}', '{{invoice_due_date}}', '{{nda_attached}}',
    '{{termination_notice_period}}', '{{bfca_sign_name}}', '{{bfca_sign_position}}', '{{bfca_sign_date}}',
    '{{facilitator_sign_name}}', '{{facilitator_sign_position}}', '{{facilitator_sign_date}}'
  ],
  mentor: [],
  delivery: []
};

export default function ContractTemplates() {
  const { user } = useAuth();
  const isAdminOrStaff = user.user?.role === 'admin' || user?.role === 'staff';
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', type: types[0], content: '' });
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
    setForm({ id: null, name: '', type: types[0], content: '' });
    setShowForm(true);
  }
  function openEdit(t) {
    setForm({ id: t._id || t.id, name: t.name, type: t.type, content: t.content });
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

  function insertPlaceholder(ph) {
    const textarea = document.getElementById('template-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    setForm(f => ({
      ...f,
      content: before + ph + after
    }));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + ph.length;
    }, 0);
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
              <tr key={t._id || t.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{t.name}</td>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2 text-gray-600 text-sm max-w-xs truncate">{t.content?.slice(0, 60)}...</td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowForm(false)} />
          <div className="relative w-full h-full max-h-screen flex flex-col md:flex-row md:items-stretch md:justify-center">
            <div className="absolute top-4 right-8 z-20">
              <button className="text-gray-500 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-2xl" onClick={() => setShowForm(false)}>
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>
            <div className="bg-white rounded-l-lg shadow-lg p-8 w-full md:w-[480px] flex flex-col justify-between z-10 overflow-y-auto max-h-full">
              <h2 className="text-3xl font-bold mb-8 text-center text-[#2EAB2C]">{form.id ? 'Edit' : 'Add'} Contract Template</h2>
              <form className="space-y-8 flex-1" onSubmit={handleFormSubmit}>
                <div>
                  <label className="block font-semibold mb-1">Template Name <span className="text-red-500">*</span></label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Mentor Agreement, Company SLA"
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Template Type <span className="text-red-500">*</span></label>
                  <select name="type" value={form.type} onChange={handleFormChange} className="w-full px-4 py-2 border rounded">
                    {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">Choose the role this template is for (e.g., company, mentor, freelancer, delivery).</div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Template Content <span className="text-red-500">*</span></label>
                  <textarea
                    id="template-content"
                    name="content"
                    value={form.content}
                    onChange={handleFormChange}
                    placeholder="Write your contract here. Use placeholders like {{client_name}}, {{training_date}}, etc."
                    className="w-full px-4 py-2 border rounded min-h-[180px]"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Use <span className="font-mono bg-gray-100 px-1">{'{{placeholder}}'}</span> for dynamic fields. Example: <span className="font-mono bg-gray-100 px-1">{'Dear {{client_name}},'}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  <button type="submit" className="flex-1 bg-[#2EAB2C] text-white py-3 rounded hover:bg-green-800 shadow font-semibold text-lg" disabled={saving}>{form.id ? 'Update' : 'Add'} Template</button>
                  <button type="button" className="flex-1 bg-gray-200 text-gray-700 py-3 rounded hover:bg-gray-300 shadow font-semibold text-lg" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
            <div className="bg-gray-50 rounded-r-lg shadow-lg p-8 w-full md:w-[520px] flex flex-col z-10 overflow-y-auto max-h-full border-l border-gray-200">
              <div className="mb-6">
                <div className="font-semibold mb-2 text-lg">Recommended Placeholders</div>
                <div className="flex flex-wrap gap-2">
                  {(placeholdersByType[form.type] || []).map(ph => (
                    <button
                      type="button"
                      key={ph}
                      className="bg-gray-100 border px-2 py-1 rounded text-xs font-mono hover:bg-green-100"
                      onClick={() => insertPlaceholder(ph)}
                      title={`Insert ${ph}`}
                    >
                      {ph}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="font-semibold mb-2 text-lg">Live Preview (with example values)</div>
                <div className="bg-white border p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto flex-1">
                  {form.content.replace(/{{(.*?)}}/g, (match, p1) => {
                    // Example values for preview
                    const examples = {
                      client_name: 'Jane Doe', client_organization: 'Acme Corp', client_email: 'jane@acme.com', client_phone: '01234 567890', agreement_date: '2024-07-01',
                      training_title: 'Understanding and Supporting Black Foster Carers', training_format: 'In-person', training_location: 'Client Premises', training_date: '2024-07-15', training_duration: 'Full Day',
                      max_participants_online: '15', max_participants_in_person: '25', course_fee: '£1,000', deposit_amount: '£500', final_balance_due_date: '2024-07-10', payment_reference: 'Jane Doe 2024-07-15',
                      client_sign_name: 'Jane Doe', client_sign_position: 'Manager', client_sign_date: '2024-07-01', bfca_sign_date: '2024-07-01',
                      facilitator_name: 'John Smith', facilitator_address: '123 Main St', effective_date: '2024-07-01', half_day_rate: '£300', full_day_rate: '£500', session_details: 'Full Day', participant_numbers: '20', pre_approved_expenses: '£50', invoice_due_date: '2024-07-20', nda_attached: 'Yes', termination_notice_period: '30 days', bfca_sign_name: 'Rachel Cole', bfca_sign_position: 'CEO', facilitator_sign_name: 'John Smith', facilitator_sign_position: 'Trainer', facilitator_sign_date: '2024-07-01',
                      mentor_name: 'Sarah Mentor', mentor_email: 'mentor@example.com', mentor_phone: '01234 111222', start_date: '2024-08-01', end_date: '2024-08-31', session_topic: 'Mentoring Skills', session_date: '2024-08-10', session_time: '10:00 AM',
                      delivery_staff_name: 'Delivery Bob', delivery_date: '2024-09-01', delivery_address: '123 Delivery St', delivery_time: '2:00 PM', package_details: 'Box of materials'
                    };
                    return examples[p1.trim()] || match;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 