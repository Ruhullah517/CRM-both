import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { mockContacts, mockEmails } from "../utils/mockData";

const initialContacts = [
  {
    id: 1,
    name: 'Foster Care Partner',
    email: 'partner@fostercare.com',
    phone: '01234 567890',
    tags: ['Partner', 'Training'],
    notes: 'Key partner for training events.',
  },
  {
    id: 2,
    name: 'Local Authority',
    email: 'la@council.gov.uk',
    phone: '09876 543210',
    tags: ['Client'],
    notes: '',
  },
];

const tagColors = {
  training: 'bg-green-100 text-[#2EAB2C]',
  mentoring: 'bg-blue-100 text-blue-800',
  partner: 'bg-yellow-100 text-yellow-800',
  client: 'bg-purple-100 text-purple-800',
};

const ContactList = ({ onSelect, onAdd }) => {
  const [search, setSearch] = useState("");
  const filtered = mockContacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Contact</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Date Added</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">{c.type}</td>
                <td className="px-4 py-2 flex flex-wrap gap-1">
                  {c.tags.map(tag => (
                    <span key={tag} className={`px-2 py-1 rounded text-xs font-semibold ${tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
                  ))}
                </td>
                <td className="px-4 py-2">{c.email}</td>
                <td className="px-4 py-2">{c.dateAdded}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="mb-2"><span className="font-semibold">Tags:</span> {contact.tags.map(tag => (
      <span key={tag} className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{tag}</span>
    ))}</div>
    <div className="mb-2"><span className="font-semibold">Date Added:</span> {contact.dateAdded}</div>
    <div className="mb-2"><span className="font-semibold">Notes:</span> {contact.notes}</div>
    <h3 className="font-semibold mt-4 mb-1">Email History</h3>
    <ul className="mb-2 list-disc ml-6 text-sm">{contact.emailHistory.map(e => <li key={e.id}>{e.subject} <span className="text-gray-400">({e.date})</span></li>)}</ul>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const ContactForm = ({ contact, onBack }) => (
  <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-4">{contact ? "Edit" : "Add"} Contact</h2>
    {/* Placeholder form fields */}
    <form className="space-y-4">
      <input placeholder="Name" defaultValue={contact?.name} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Email" defaultValue={contact?.email} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Tags (comma separated)" defaultValue={contact?.tags?.join(", ")} className="w-full px-4 py-2 border rounded" />
      <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{contact ? "Save" : "Add"}</button>
    </form>
  </div>
);

const Contacts = () => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  if (view === "detail" && selected) return <ContactDetail contact={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <ContactForm contact={selected} onBack={() => { setView("detail"); }} />;
  if (view === "add") return <ContactForm onBack={() => setView("list")} />;
  return <ContactList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} />;
};

export default Contacts; 