import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from '../services/emailTemplates';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom CSS for full-screen editor
const editorStyles = `
  .ql-editor {
    min-height: 400px !important;
    height: 100% !important;
  }
  .ql-container {
    height: calc(100% - 42px) !important;
  }
`;

const categoryOptions = ['Follow-up', 'Newsletter', 'Invite', 'Training', 'Mentoring', 'Other'];

export default function EmailTemplates() {
  const { user } = useAuth();
  const isAdminOrStaff = user.user?.role === 'admin' || user?.role === 'staff';
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', subject: '', body: '', logoFile: null, logoFileName: '', category: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const backendUrl="https://crm-backend-0v14.onrender.com"

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching templates...');
      const data = await getEmailTemplates();
      console.log('Templates received:', data);
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates: ' + err.message);
    }
    setLoading(false);
  }

  function openAdd() {
    setForm({ id: null, name: '', subject: '', body: '', logoFile: null, logoFileName: '', category: '' });
    setLogoPreview(null);
    setShowForm(true);
  }
  function openEdit(t) {
    // Clean up any duplicate logos and empty logo tags in the body
    let cleanBody = t.body;
    
    // Remove empty logo tags like <img alt="Logo"> or <p><img alt="Logo"></p>
    cleanBody = cleanBody.replace(/<p>\s*<img[^>]*alt="Logo"[^>]*>\s*<\/p>/g, '');
    cleanBody = cleanBody.replace(/<img[^>]*alt="Logo"[^>]*>/g, '');
    
    // Remove duplicate logo divs
    const logoPattern = /<div style="margin-bottom: 20px;"><img src="[^"]*" alt="Logo" style="max-height: 60px; max-width: 200px;" \/><\/div>/;
    const logos = cleanBody.match(new RegExp(logoPattern, 'g'));
    if (logos && logos.length > 1) {
      // Remove all but the first logo
      cleanBody = cleanBody.replace(logoPattern, '');
      cleanBody = logos[0] + cleanBody;
    }
    
    setForm({ ...t, id: t._id || t.id, logoFile: null, body: cleanBody });
    setLogoPreview(t.logoFile ? t.logoFile : null);
    setShowForm(true);
  }

  function openAdd() {
    setForm({ id: null, name: '', subject: '', body: '', logoFile: null, logoFileName: '', category: '' });
    setLogoPreview(null);
    setShowForm(true);
  }
  function handleFormChange(e) {
    const { name, value, files } = e.target;
    if (name === 'logoFile' && files && files[0]) {
      const file = files[0];
      setForm(f => ({ ...f, logoFile: file, logoFileName: file.name }));
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        // Don't add logo HTML to body - let the email controller handle it
        setForm(f => {
          // Clean up any existing empty logo tags first
          let cleanBody = f.body;
          cleanBody = cleanBody.replace(/<p>\s*<img[^>]*alt="Logo"[^>]*>\s*<\/p>/g, '');
          cleanBody = cleanBody.replace(/<img[^>]*alt="Logo"[^>]*>/g, '');
          
          return { 
            ...f, 
            logoFile: file, 
            logoFileName: file.name,
            body: cleanBody
          };
        });
      };
      reader.readAsDataURL(file);
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }
  function handleQuillChange(value) {
    setForm(f => ({ ...f, body: value }));
  }

  function removeLogo() {
    setForm(f => ({ ...f, logoFile: null, logoFileName: '' }));
    setLogoPreview(null);
    // Clean up any empty logo tags that might exist
    const currentBody = form.body;
    let cleanBody = currentBody;
    cleanBody = cleanBody.replace(/<p>\s*<img[^>]*alt="Logo"[^>]*>\s*<\/p>/g, '');
    cleanBody = cleanBody.replace(/<img[^>]*alt="Logo"[^>]*>/g, '');
    setForm(f => ({ ...f, body: cleanBody }));
  }
  async function handleFormSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('subject', form.subject);
      formData.append('body', form.body);
      formData.append('category', form.category);
      
      if (form.logoFile) {
        formData.append('logo', form.logoFile);
      }
      
      if (form.id) {
        await updateEmailTemplate(form.id, formData);
      } else {
        await createEmailTemplate(formData);
      }
      setShowForm(false);
      fetchTemplates();
    } catch (err) {
      setError('Failed to save template');
    }
    setLoading(false);
  }
  async function handleDelete(id) {
    if (!window.confirm('Delete this template?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteEmailTemplate(id);
      fetchTemplates();
    } catch (err) {
      setError('Failed to delete template');
    }
    setLoading(false);
  }

  return (
    <>
      <style>{editorStyles}</style>
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-6">Email Templates</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <div className="mb-4 text-blue-600">Loading templates...</div>}
      {isAdminOrStaff && (
        <button
          className="mb-4 bg-[#2EAB2C] text-white px-4 py-2 rounded hover:bg-green-800 shadow flex items-center gap-2"
          onClick={openAdd}
        >
          <PlusIcon className="w-5 h-5" /> Add Template
        </button>
      )}
      {!loading && templates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No email templates found.</p>
          <p className="text-sm mt-2">Create your first template to get started.</p>
        </div>
      )}
      {!loading && templates.length > 0 && (
        <>
          {/* Table for sm and up */}
          <div className="hidden sm:block">
            <table className="min-w-full bg-white rounded shadow mb-8">
              <thead>
                <tr className="bg-green-50">
                  <th className="px-4 py-2 text-left font-semibold text-green-900">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-900">Subject</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-900">Preview</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-900">Category</th>
                  <th className="px-4 py-2 text-left font-semibold text-green-900">Branding</th>
                  {isAdminOrStaff && <th className="px-4 py-2 text-left font-semibold text-green-900">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t._id || t.id} className="border-t hover:bg-green-50 transition">
                    <td className="px-4 py-2 font-semibold">{t.name}</td>
                    <td className="px-4 py-2">{t.subject}</td>
                    <td className="px-4 py-2 text-gray-600 text-sm max-w-xs break-words" dangerouslySetInnerHTML={{ __html: t.body.replace(/<[^>]+>/g, '') }} />
                    <td className="px-4 py-2">{t.category}</td>
                                    <td className="px-4 py-2">
                  {t.logoFile && <img src={t.logoFile} alt="logo" className="inline h-6 align-middle" />}
                </td>
                    {isAdminOrStaff && (
                      <td className="px-4 py-2 flex flex-col gap-2">
                        <button className="text-[#2EAB2C] hover:underline flex items-center gap-1" onClick={() => openEdit(t)}>
                          <PencilSquareIcon className="w-5 h-5" /> Edit
                        </button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(t._id || t.id)}>Delete</button>
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
              <div key={t._id || t.id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-base">{t.name}</span>
                  {isAdminOrStaff && (
                    <div className="flex gap-2">
                      <button className="text-[#2EAB2C] hover:underline flex items-center gap-1" onClick={() => openEdit(t)}>
                        <PencilSquareIcon className="w-5 h-5" /> Edit
                      </button>
                      <button className="text-red-600 hover:underline" onClick={() => handleDelete(t._id || t.id)}>Delete</button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Subject:</span> {t.subject}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Preview:</span>{' '}
                  <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: t.body.replace(/<[^>]+>/g, '') }} />
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Category:</span> {t.category}
                </div>
                <div className="text-sm text-gray-700 flex items-center gap-2">
                  {t.logoFile && <img src={t.logoFile} alt="logo" className="inline h-6 align-middle" />}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full h-full max-w-none flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{form.id ? 'Edit' : 'Add'} Email Template</h2>
              <button className="text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className="flex-1 overflow-y-auto p-4 space-y-4" id="email-template-form" onSubmit={handleFormSubmit}>
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
              <div className="flex-1 flex flex-col">
                <label className="block font-semibold mb-1">Email Body</label>
                <div className="border rounded flex-1 flex flex-col">
                  <ReactQuill
                    value={form.body}
                    onChange={handleQuillChange}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'font': [] }, { 'size': [] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'align': [] }],
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['clean']
                      ]
                    }}
                    style={{ height: '100%', minHeight: '400px' }}
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Logo Image</label>
                <input
                  type="file"
                  name="logoFile"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded"
                />
                {logoPreview && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={logoPreview} alt="Logo preview" className="h-12 w-auto" />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remove Logo
                    </button>
                  </div>
                )}
              </div>

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </form>
            <div className="p-4 border-t bg-white">
              <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 shadow disabled:opacity-60 disabled:cursor-not-allowed" form="email-template-form" disabled={loading}>
                {loading ? (form.id ? 'Updating...' : 'Adding...') : (form.id ? 'Update' : 'Add')} Template
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
} 