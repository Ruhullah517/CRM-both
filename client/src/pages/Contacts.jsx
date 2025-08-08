import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContacts, createContact, updateContact, deleteContact } from '../services/contacts';
import { getUsers } from '../services/users';
import Loader from '../components/Loader';
import { getEmailTemplates, sendBulkEmail } from '../services/emailTemplates';

const tagColors = {
  training: 'bg-green-100 text-[#2EAB2C]',
  mentoring: 'bg-blue-100 text-blue-800',
  partner: 'bg-yellow-100 text-yellow-800',
  client: 'bg-purple-100 text-purple-800',
};

const contactTypes = ['Partner', 'Client', 'Mentor', 'Trainer', 'Other'];

const ContactList = ({ onSelect, onAdd, contacts, onDelete, selectedIds, onSelectContact, onSelectAll }) => {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.includes(c._id));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Contact</button>
      </div>
      {/* Table for sm and up */}
      <div className="overflow-x-auto rounded shadow bg-white hidden sm:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-2 py-2"><input type="checkbox" checked={allSelected} onChange={e => onSelectAll(filtered.map(c => c._id), e.target.checked)} /></th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Date Added</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-2 py-2"><input type="checkbox" checked={selectedIds.includes(c._id)} onChange={e => onSelectContact(c._id, e.target.checked)} /></td>
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2 flex flex-wrap gap-1">
                  {(c.tags || []).map(tag => (
                    <span key={tag} className={`px-2 py-1 rounded text-xs font-semibold ${tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
                  ))}
                </td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : ''}</td>
                <td className="px-4 py-2">
                  <button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-black text-white font-semibold hover:bg-gray-600">
                    View
                  </button>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => onDelete(c)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="sm:hidden flex flex-col gap-4">
        {filtered.map(c => (
          <div key={c._id} className="rounded shadow bg-white p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-base">{c.name}</span>
              <span className="text-xs px-2 py-1 rounded bg-green-50">{c.type}</span>
            </div>
            <div className="flex flex-wrap gap-1 text-sm">
              {(c.tags || []).map(tag => (
                <span key={tag} className={`px-2 py-1 rounded text-xs font-semibold ${tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
              ))}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Email:</span> {c.email}
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Date Added:</span> {c.dateAdded ? new Date(c.dateAdded).toLocaleDateString() : ''}
            </div>
            <div className="flex gap-2 mt-2">
              <input type="checkbox" checked={selectedIds.includes(c._id)} onChange={e => onSelectContact(c._id, e.target.checked)} />
              <button
                onClick={() => onSelect(c)}
                className="flex-1 px-3 py-2 rounded bg-black text-white font-semibold hover:bg-gray-600"
              >
                View
              </button>
              <button
                onClick={() => onDelete(c)}
                className="flex-1 px-3 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContactDetail = ({ contact, onBack, onEdit }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-2">{contact.name}</h2>
    <div className="mb-2"><span className="font-semibold">Type:</span> {contact.type}</div>
    <div className="mb-2"><span className="font-semibold">Email:</span> {contact.email}</div>
    <div className="mb-2"><span className="font-semibold">Phone:</span> {contact.phone}</div>
    <div className="mb-2"><span className="font-semibold">Organization Name:</span> {contact.organizationName}</div>
    <div className="mb-2"><span className="font-semibold">Organization Address:</span> {contact.organizationAddress}</div>
    <div className="mb-2"><span className="font-semibold">Tags:</span> {(contact.tags || []).map(tag => (
      <span key={tag} className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
    ))}</div>
    <div className="mb-2"><span className="font-semibold">Date Added:</span> {contact.dateAdded ? new Date(contact.dateAdded).toLocaleDateString() : ''}</div>
    <div className="mb-2"><span className="font-semibold">Notes:</span> {contact.notes}</div>
    <h3 className="font-semibold mt-4 mb-1">Communication History</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{(contact.communicationHistory || []).map((c, i) => <li key={i}>{c.type} - {c.summary} <span className="text-gray-400">({c.date ? new Date(c.date).toLocaleDateString() : ''})</span></li>)}</ul>
    <h3 className="font-semibold mt-4 mb-1">Email History</h3>
    {contact.emailHistory && contact.emailHistory.length > 0 ? (
      <div className="mb-4">
        <div className="bg-gray-50 rounded p-3">
          {contact.emailHistory.map((email, i) => (
            <div key={i} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">{email.subject || 'No Subject'}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {email.templateName && <span className="mr-2">Template: {email.templateName}</span>}
                    {email.status && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        email.status === 'sent' ? 'bg-green-100 text-green-700' : 
                        email.status === 'failed' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {email.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-2">
                  {email.date ? new Date(email.date).toLocaleString() : 'Unknown date'}
                </div>
              </div>
              {email.error && (
                <div className="text-xs text-red-600 mt-1">
                  Error: {email.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="text-gray-500 text-sm mb-4">No emails sent to this contact yet.</div>
    )}
    <div className="flex gap-2 mt-4">
      <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
    </div>
  </div>
);

const ContactForm = ({ contact, onBack, onSave, loading }) => {
  const [form, setForm] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    type: contact?.type || 'Partner',
    tags: contact?.tags || [],
    notes: contact?.notes || '',
    emailHistory: contact?.emailHistory || [],
    user_id: contact?.user_id || '',
    organizationName: contact?.organizationName || '',
    organizationAddress: contact?.organizationAddress || '',
    communicationHistory: contact?.communicationHistory || [],
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'tags') {
      setForm(f => ({ ...f, tags: value.split(',').map(t => t.trim()).filter(Boolean) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...contact, ...form });
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{contact ? "Edit" : "Add"} Contact</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <input name="organizationName" placeholder="Organization Name" value={form.organizationName} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <input name="organizationAddress" placeholder="Organization Address" value={form.organizationAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-2 border rounded">
          {contactTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input name="tags" placeholder="Tags (comma separated)" value={form.tags.join(', ')} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="w-full px-4 py-2 border rounded" />
        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold" disabled={loading}>{loading ? 'Saving...' : (contact ? "Save" : "Add")}</button>
      </form>
    </div>
  );
};

const Contacts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [placeholders, setPlaceholders] = useState({});
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
    getEmailTemplates().then(setEmailTemplates);
  }, []);

  async function fetchContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      // Parse tags and emailHistory if needed
      const parsed = data.map(c => ({
        ...c,
        tags: typeof c.tags === 'string' ? JSON.parse(c.tags) : (c.tags || []),
        emailHistory: typeof c.emailHistory === 'string' ? JSON.parse(c.emailHistory) : (c.emailHistory || []),
        communicationHistory: typeof c.communicationHistory === 'string' ? JSON.parse(c.communicationHistory) : (c.communicationHistory || []),
      }));
      setContacts(parsed);
    } catch (err) {
      setError('Failed to load contacts');
    }
    setLoading(false);
  }

  async function handleSaveContact(contact) {
    setSaving(true);
    setError(null);
    try {
      if (contact._id) {
        await updateContact(contact._id, contact);
      } else {
        await createContact(contact);
      }
      fetchContacts();
      setView("list");
    } catch (err) {
      setError('Failed to save contact');
    }
    setSaving(false);
  }

  async function handleDeleteContact(contact) {
    if (!window.confirm(`Delete contact '${contact.name}'?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteContact(contact._id);
      fetchContacts();
      setView("list");
    } catch (err) {
      setError('Failed to delete contact');
    }
    setSaving(false);
  }

  function handleSelectContact(id, checked) {
    setSelectedIds(ids => checked ? [...ids, id] : ids.filter(i => i !== id));
  }
  function handleSelectAll(ids, checked) {
    setSelectedIds(checked ? ids : []);
  }

  function openBulkEmail() {
    setSelectedTemplateId("");
    setPlaceholders({});
    setSendResults(null);
    setShowBulkEmail(true);
  }

  function closeBulkEmail() {
    setShowBulkEmail(false);
  }

  function handleTemplateChange(e) {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    const template = emailTemplates.find(t => t._id === templateId || t.id === templateId);
    if (!template) return setPlaceholders({});
    // Extract placeholders from subject and body
    const matches = (template.subject + ' ' + template.body).match(/{{\s*([\w_\d]+)\s*}}/g) || [];
    const phs = {};
    for (const id of selectedIds) {
      phs[id] = {};
      matches.forEach(m => {
        const key = m.replace(/{{|}}/g, '').trim();
        phs[id][key] = contacts.find(c => c._id === id)?.[key] || '';
      });
    }
    setPlaceholders(phs);
  }

  function handlePlaceholderChange(contactId, key, value) {
    setPlaceholders(phs => ({ ...phs, [contactId]: { ...phs[contactId], [key]: value } }));
  }

  async function handleSendBulkEmail() {
    setSending(true);
    setSendResults(null);
    const template = emailTemplates.find(t => t._id === selectedTemplateId || t.id === selectedTemplateId);
    if (!template) return;
    const recipients = selectedIds.map(id => ({
      email: contacts.find(c => c._id === id)?.email,
      data: placeholders[id] || {},
    }));
    try {
      const emailResult = await sendBulkEmail({ templateId: selectedTemplateId, recipients });
      setSendResults(emailResult.results);
      
      // Update email history for each contact
      const updatedContacts = contacts.map(contact => {
        const emailResultItem = emailResult.results?.find(r => r.email === contact.email);
        if (emailResultItem) {
          const emailRecord = {
            subject: template.subject,
            templateName: template.name,
            date: new Date().toISOString(),
            status: emailResultItem.status,
            error: emailResultItem.error || null
          };
          return {
            ...contact,
            emailHistory: [...(contact.emailHistory || []), emailRecord]
          };
        }
        return contact;
      });
      setContacts(updatedContacts);
      
      // Check if all emails were sent successfully
      const allSuccessful = emailResult.results.every(r => r.status === 'sent');
      if (allSuccessful) {
        // Show success message and redirect after a short delay
        setTimeout(() => {
          alert('All emails sent successfully!');
          setShowBulkEmail(false);
          setSelectedIds([]);
          setSendResults(null);
        }, 1500);
      }
    } catch (err) {
      setSendResults([{ email: 'All', status: 'failed', error: err.message }]);
    }
    setSending(false);
  }

  if (view === "list") {
    return (
      <>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {loading && <Loader />}
        <ContactList
          onSelect={c => { setSelected(c); setView("detail"); }}
          onAdd={() => { setSelected(null); setView("form"); }}
          contacts={contacts}
          onDelete={handleDeleteContact}
          selectedIds={selectedIds}
          onSelectContact={handleSelectContact}
          onSelectAll={handleSelectAll}
        />
        {selectedIds.length > 0 && (
          <div className="max-w-5xl mx-auto p-4 flex justify-end">
            <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800" onClick={openBulkEmail}>
              Send Bulk Email
            </button>
          </div>
        )}
        {showBulkEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-8 w-full max-w-2xl relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center" onClick={closeBulkEmail}>✕</button>
              <h2 className="text-xl font-bold mb-4">Send Email</h2>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Select Template</label>
                <select className="w-full px-4 py-2 border rounded" value={selectedTemplateId} onChange={handleTemplateChange}>
                  <option value="">Select...</option>
                  {emailTemplates.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>)}
                </select>
              </div>
              {selectedTemplateId && (
                <div className="mb-4">
                  <label className="block font-semibold mb-1">Fill Placeholders</label>
                  <div className="max-h-64 overflow-y-auto border rounded p-2">
                    {selectedIds.map(id => (
                      <div key={id} className="mb-2 border-b pb-2">
                        <div className="font-semibold">{contacts.find(c => c._id === id)?.name || id}</div>
                        {placeholders[id] && Object.keys(placeholders[id]).length > 0 ? (
                          Object.keys(placeholders[id]).map(key => (
                            <div key={key} className="flex items-center gap-2 my-1">
                              <span className="w-32 text-sm text-gray-700">{key}:</span>
                              <input className="flex-1 px-2 py-1 border rounded" value={placeholders[id][key] || ''} onChange={e => handlePlaceholderChange(id, key, e.target.value)} />
                            </div>
                          ))
                        ) : <span className="text-xs text-gray-400">No placeholders</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={closeBulkEmail} disabled={sending}>Cancel</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSendBulkEmail} disabled={sending || !selectedTemplateId}>
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
              {sending && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Sending emails...</p>
                </div>
              )}
              {sendResults && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Results</h3>
                  <ul className="max-h-32 overflow-y-auto text-sm">
                    {sendResults.map((r, i) => (
                      <li key={i} className={r.status === 'sent' ? 'text-green-700' : 'text-red-700'}>
                        {r.email}: {r.status} {r.error && <span>- {r.error}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  if (view === "detail" && selected) return <ContactDetail contact={selected} onBack={() => setView("list")} onEdit={() => setView("form")} />;
  if (view === "form" && selected) return <ContactForm contact={selected} onBack={() => setView("list")} onSave={handleSaveContact} loading={false} />;
  if (view === "add") return <ContactForm onBack={() => setView("list")} onSave={handleSaveContact} loading={false} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading && <Loader />}
    </>
  );
};

export default Contacts; 