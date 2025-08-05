import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContacts, createContact, updateContact, deleteContact } from '../services/contacts';
import { getUsers } from '../services/users';
import Loader from '../components/Loader';

const tagColors = {
  training: 'bg-green-100 text-[#2EAB2C]',
  mentoring: 'bg-blue-100 text-blue-800',
  partner: 'bg-yellow-100 text-yellow-800',
  client: 'bg-purple-100 text-purple-800',
};

const contactTypes = ['Partner', 'Client', 'Mentor', 'Trainer', 'Other'];

const ContactList = ({ onSelect, onAdd, contacts, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
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
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
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
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">{c.type}</td>
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
    <ul className="mb-2 list-disc ml-6 text-sm">{(contact.emailHistory || []).map((e, i) => <li key={i}>{e.subject} <span className="text-gray-400">({e.date})</span></li>)}</ul>
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
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
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

  if (view === "detail" && selected) return <ContactDetail contact={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <ContactForm contact={selected} onBack={() => setView("detail")} onSave={handleSaveContact} loading={saving} />;
  if (view === "add") return <ContactForm onBack={() => setView("list")} onSave={handleSaveContact} loading={saving} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <ContactList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} contacts={contacts} onDelete={handleDeleteContact} />
      {loading && <Loader />}
    </>
  );
};

export default Contacts; 