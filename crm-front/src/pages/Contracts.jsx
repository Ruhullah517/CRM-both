import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getContracts, createContract, updateContract } from '../services/contracts';

const statuses = ['Signed', 'Pending', 'Expired'];
const roles = ['Trainer', 'Mentor'];
const statusColors = {
  signed: 'bg-green-100 text-[#2EAB2C]',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
};

const ContractList = ({ onSelect, onAdd, contracts }) => {
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
    {contract.filePath && <div className="mb-2"><span className="font-semibold">File:</span> <a href={contract.filePath} className="text-blue-700 hover:underline">{contract.filePath}</a></div>}
    <button onClick={onEdit} className="mt-4 px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
  </div>
);

const ContractForm = ({ contract, onBack, onSave }) => {
  const [name, setName] = useState(contract?.name || "");
  const [role, setRole] = useState(contract?.role || "");
  const [status, setStatus] = useState(contract?.status || "Pending");
  const [createdBy, setCreatedBy] = useState(contract?.createdBy || "");
  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...contract,
      name,
      role,
      status,
      createdBy,
    });
  }
  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{contract ? "Edit" : "Add"} Contract</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input placeholder="Role" value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded" />
        <input placeholder="Created By" value={createdBy} onChange={e => setCreatedBy(e.target.value)} className="w-full px-4 py-2 border rounded" />
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
      if (contract.id) {
        await updateContract(contract.id, contract);
      } else {
        await createContract(contract);
      }
      fetchContracts();
      setView("list");
    } catch (err) {
      setError('Failed to save contract');
    }
  }

  if (view === "detail" && selected) return <ContractDetail contract={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} />;
  if (view === "edit" && selected) return <ContractForm contract={selected} onBack={() => setView("detail")} onSave={handleSaveContract} />;
  if (view === "add") return <ContractForm onBack={() => setView("list")} onSave={handleSaveContract} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <ContractList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => setView("add")} contracts={contracts} />
      {loading && <div className="text-center py-4">Loading...</div>}
    </>
  );
};

export default Contracts;
