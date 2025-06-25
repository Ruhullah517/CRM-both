import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { mockContracts } from "../utils/mockData";

const initialContracts = [
  {
    id: 1,
    role: 'Trainer',
    status: 'Signed',
    freelancer: 'Anna White',
    template: 'Trainer Agreement',
    rate: '£30/hr',
    signedBy: 'Anna White',
    signedDate: '2024-06-10',
    files: ['trainer_agreement.pdf'],
  },
  {
    id: 2,
    role: 'Mentor',
    status: 'Pending',
    freelancer: 'James Black',
    template: 'Mentor Contract',
    rate: '£25/hr',
    signedBy: '',
    signedDate: '',
    files: [],
  },
];

const statuses = ['Signed', 'Pending', 'Expired'];
const roles = ['Trainer', 'Mentor'];
const freelancers = ['Anna White', 'James Black'];
const templates = ['Trainer Agreement', 'Mentor Contract'];

const statusColors = {
  signed: 'bg-green-100 text-[#2EAB2C]',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
};

const ContractList = ({ onSelect, onAdd }) => {
  const [search, setSearch] = useState("");
  const filtered = mockContracts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Contract</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created By</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">{c.role}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.createdBy}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContractDetail = ({ contract, onBack, onEdit }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-2">{contract.name}</h2>
    <div className="mb-2"><span className="font-semibold">Role:</span> {contract.role}</div>
    <div className="mb-2"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[contract.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{contract.status}</span></div>
    <div className="mb-2"><span className="font-semibold">Created By:</span> {contract.createdBy}</div>
    <div className="mb-2"><span className="font-semibold">Signed URL:</span> <a href={contract.signedUrl} className="text-blue-700 hover:underline">{contract.signedUrl}</a></div>
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const ContractForm = ({ contract, onBack }) => (
  <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-xl font-bold mb-4">{contract ? "Edit" : "Add"} Contract</h2>
    {/* Placeholder form fields */}
    <form className="space-y-4">
      <input placeholder="Name" defaultValue={contract?.name} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Role" defaultValue={contract?.role} className="w-full px-4 py-2 border rounded" />
      <input placeholder="Status" defaultValue={contract?.status} className="w-full px-4 py-2 border rounded" />
      <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{contract ? "Save" : "Add"}</button>
    </form>
  </div>
);

const Contracts = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  if (view === "detail" && selected) return <ContractDetail contract={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <ContractForm contract={selected} onBack={() => { setView("detail"); }} />;
  if (view === "add") return <ContractForm onBack={() => setView("list")} />;
  return <ContractList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} />;
};

export default Contracts;
