import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContracts, createContract, updateContract, deleteContract } from '../services/contracts';
import { getUsers } from '../services/users';
import { getCandidates } from '../services/candidates';

const statuses = ['Signed', 'Pending', 'Expired'];
const roles = ['Trainer', 'Mentor'];
const statusColors = {
  signed: 'bg-green-100 text-[#2EAB2C]',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
};

const ContractList = ({ onSelect, onAdd, contracts, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = contracts.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));
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
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c.name}</td>
                <td className="px-4 py-2">{c.role}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.createdBy?.name || c.createdBy || '-'}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
                <td className="px-4 py-2"><button onClick={() => onDelete(c)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button></td>
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
    <div className="mb-2"><span className="font-semibold">Created By:</span> {contract.createdBy?.name || contract.createdBy || '-'}</div>
    {contract.filePath && <div className="mb-2"><span className="font-semibold">File:</span> <a href={contract.filePath} className="text-blue-700 hover:underline">{contract.filePath}</a></div>}
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const ContractForm = ({ contract, onBack, onSave }) => {
  const [name, setName] = useState(contract?.name || "");
  const [role, setRole] = useState(contract?.role || roles[0]);
  const [status, setStatus] = useState(contract?.status || statuses[1]);
  const [createdBy, setCreatedBy] = useState(contract?.createdBy || "");
  const [candidate_id, setCandidateId] = useState(contract?.candidate_id || "");
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsers();
      setUsers(data);
    }
    async function fetchCandidates() {
      const data = await getCandidates();
      setCandidates(data);
    }
    fetchUsers();
    fetchCandidates();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...contract,
      name,
      role,
      status,
      createdBy,
      candidate_id,
    });
  }
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{contract ? "Edit" : "Add"} Contract</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded">
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded">
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={createdBy} onChange={e => setCreatedBy(e.target.value)} className="w-full px-4 py-2 border rounded">
          <option value="">Select Created By</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
        <select value={candidate_id} onChange={e => setCandidateId(e.target.value)} className="w-full px-4 py-2 border rounded">
          <option value="">Select Candidate</option>
          {candidates.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{contract ? "Save" : "Add"}</button>
      </form>
    </div>
  );
};

const Contracts = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    setLoading(true);
    try {
      const data = await getContracts();
      setContracts(data);
    } catch (err) {
      setError('Failed to load contracts');
    }
    setLoading(false);
  }

  async function handleSaveContract(contract) {
    setError(null);
    try {
      if (contract._id) {
        await updateContract(contract._id, contract);
      } else {
        await createContract(contract);
      }
      fetchContracts();
      setView("list");
    } catch (err) {
      setError('Failed to save contract');
    }
  }

  async function handleDeleteContract(contract) {
    if (!window.confirm(`Delete contract '${contract.name}'?`)) return;
    setError(null);
    try {
      await deleteContract(contract._id);
      fetchContracts();
      setView("list");
    } catch (err) {
      setError('Failed to delete contract');
    }
  }

  if (view === "detail" && selected) return <ContractDetail contract={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <ContractForm contract={selected} onBack={() => setView("detail")} onSave={handleSaveContract} />;
  if (view === "add") return <ContractForm onBack={() => setView("list")} onSave={handleSaveContract} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <ContractList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} contracts={contracts} onDelete={handleDeleteContract} />
      {loading && <div className="text-center py-4">Loading...</div>}
    </>
  );
};

export default Contracts;
