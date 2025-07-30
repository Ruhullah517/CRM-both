import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getGeneratedContracts, generateContract, downloadContract, deleteContract } from '../services/contracts';
import { getContractTemplates } from '../services/contractTemplates';
import Loader from '../components/Loader';

const statuses = ['Signed', 'Pending', 'Expired'];
const roles = ['Trainer', 'Mentor'];
const statusColors = {
  signed: 'bg-green-100 text-[#2EAB2C]',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
};

const ContractList = ({ onSelect, onAdd, contracts, onDelete, onDownload }) => {
  const [search, setSearch] = useState("");
  const filtered = contracts.filter(c => (c.filledData?.client_name || c._id || '').toLowerCase().includes(search.toLowerCase()));
  // console.log(filtered);

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
              <th className="px-4 py-2">Agreement Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created By</th>
              <th className="px-4 py-2">PDF</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{c?.name || c._id}</td>
                <td className="px-4 py-2">{c.roleType}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.generatedBy?.name || '-'}</td>
                <td className="px-4 py-2">
                  {c.generatedDocUrl && (
                    <>
                      <a href={c.generatedDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">PDF</a>
                    </>
                  )}
                </td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ContractDetail = ({ contract, onBack, onEdit, onDelete, loading }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-2">{contract.name || contract.filledData?.client_name || contract.filledData?.facilitator_name || contract._id}</h2>
      <div className="mb-2"><span className="font-semibold">Type:</span> {contract.roleType}</div>
      <div className="mb-2"><span className="font-semibold">Status:</span> <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">{contract.status}</span></div>
      <div className="mb-2"><span className="font-semibold">Created By:</span> {contract.generatedBy?.name || '-'}</div>

      {contract.generatedDocUrl && (
        <div className="mb-2">
          <span className="font-semibold">PDF:</span>{" "}
          <a href={contract.generatedDocUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Download PDF</a>
        </div>
      )}

      {contract.generatedDocUrl && (
        <div className="my-4">
          <iframe
            src={contract.generatedDocUrl}
            title="Contract PDF Preview"
            width="100%"
            height="500px"
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
        </div>
      )}

      {contract.filledData && contract.templateId?.content && (
        <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto mt-4">
          {contract.templateId.content.replace(/{{\s*([\w_\d]+)\s*}}/g, (match, p1) => contract.filledData[p1.trim()] || `[${p1.trim()}]`)}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
        <button
          onClick={() => onDelete(contract._id)}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          {loading ? "Deleting..." : "Delete Contract"}
        </button>
      </div>
    </div>
  );
};


const ContractForm = ({ contract, onBack, onSave }) => {
  // console.log('ContractForm contract:', contract.name);
  const [agreementName, setAgreementName] = useState(contract?.name || "");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(contract?.templateId?._id || contract?.templateId || "");
  const [templateBody, setTemplateBody] = useState("");
  const [placeholderValues, setPlaceholderValues] = useState(contract?.filledData || {});
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  // Ensure form is pre-filled when contract changes (edit mode)
  useEffect(() => {
    if (!contract) {
      setAgreementName("");
      setSelectedTemplateId("");
      setPlaceholderValues({});
      return;
    }
    setAgreementName(contract.name || "");
    // Find the template in the loaded templates list
    const templateId = contract.templateId?._id || contract.templateId;
    setSelectedTemplateId(templateId || "");
    setPlaceholderValues(contract.filledData || {});
  }, [contract, templates]);

  useEffect(() => {
    async function fetchTemplates() {
      const data = await getContractTemplates();
      setTemplates(data);
    }
    fetchTemplates();
  }, []);

  // When template is selected, extract placeholders and set up form
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateBody("");
      setPlaceholderValues({});
      return;
    }
    const template = templates.find(t => t._id === selectedTemplateId || t.id === selectedTemplateId);
    if (!template) {
      setTemplateBody("");
      setPlaceholderValues({});
      return;
    }
    setTemplateBody(template.content);
    // Robust placeholder extraction: handle spaces, newlines, etc.
    const matches = template.content.match(/{{\s*([\w_\d]+)\s*}}/g) || [];
    const placeholders = matches.map(m => m.replace(/{{|}}/g, '').trim());
    // Initialize values if not already set
    setPlaceholderValues(prev => {
      const newVals = { ...prev };
      placeholders.forEach(ph => {
        if (!(ph in newVals)) newVals[ph] = '';
      });
      // Remove any old keys
      Object.keys(newVals).forEach(k => {
        if (!placeholders.includes(k)) delete newVals[k];
      });
      return newVals;
    });
  }, [selectedTemplateId, templates]);

  function handlePlaceholderChange(ph, val) {
    setPlaceholderValues(prev => ({ ...prev, [ph]: val }));
  }

  function renderFilledTemplate() {
    if (!templateBody) return '[No template selected]';
    let filled = templateBody;
    Object.entries(placeholderValues).forEach(([ph, val]) => {
      // Replace all occurrences, even with extra spaces
      filled = filled.replace(new RegExp(`{{\\s*${ph}\\s*}}`, 'g'), val || `[${ph}]`);
    });
    return filled;
  }

  // Helper: check if all placeholders are filled
  function allPlaceholdersFilled() {
    return Object.values(placeholderValues).every(val => val && val.trim() !== '');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const selectedTemplate = templates.find(t => t._id === selectedTemplateId || t.id === selectedTemplateId);
    const userId = user?.user?.id;
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }
    onSave({
      _id: contract?._id, // include ID for update
      templateId: selectedTemplateId,
      roleType: selectedTemplate?.type || 'company',
      generatedBy: userId,
      filledData: placeholderValues,
      name: agreementName,
    });
  }


  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{contract ? "Edit" : "Add"} Contract</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input placeholder="Agreement Name" value={agreementName} onChange={e => setAgreementName(e.target.value)} className="w-full px-4 py-2 border rounded" />
        {/* Template selection */}
        <div>
          <label className="block font-semibold mb-1">Contract Template</label>
          <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)} className="w-full px-4 py-2 border rounded">
            <option value="">Select Template</option>
            {templates.map(t => (
              <option key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.type})</option>
            ))}
          </select>
        </div>
        {/* Placeholder fields */}
        {selectedTemplateId && (
          <div className="bg-gray-50 p-3 rounded">
            {Object.keys(placeholderValues).length === 0 && (
              <div className="text-red-600 text-sm mb-2">No placeholders found in this template. Please check the template body.</div>
            )}
            {Object.keys(placeholderValues).length > 0 && <div className="font-semibold mb-2">Fill in contract details:</div>}
            {Object.keys(placeholderValues).map(ph => (
              <div key={ph} className="mb-2">
                <label className="block text-sm font-medium mb-1">{ph.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type="text"
                  value={placeholderValues[ph]}
                  onChange={e => handlePlaceholderChange(ph, e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            ))}
          </div>
        )}
        {/* Preview button */}
        {selectedTemplateId && (
          <button type="button" className="w-full bg-blue-100 text-blue-700 py-2 rounded font-semibold mb-2" onClick={() => setShowPreview(p => !p)}>
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        )}
        {/* Preview */}
        {showPreview && (
          <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap max-h-60 overflow-y-auto mb-2">
            {renderFilledTemplate()}
            {!allPlaceholdersFilled() && <div className="text-yellow-700 text-xs mt-2">Some fields are missing. Please fill all placeholders for a complete contract.</div>}
          </div>
        )}
        <button
          type="submit"
          disabled={!agreementName.trim() || !selectedTemplateId || !allPlaceholdersFilled() || saving}
          className={`w-full py-2 rounded font-semibold transition ${!agreementName.trim() || !selectedTemplateId || !allPlaceholdersFilled() || saving
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-[#2EAB2C] text-white hover:bg-green-800'
            }`}
        >
          {saving ? "Saving..." : (contract ? "Save" : "Add")}
        </button>
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    setLoading(true);
    try {
      const data = await getGeneratedContracts();
      setContracts(data);
    } catch (err) {
      setError('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveContract(formData) {
    setError(null);
    setSaving(true); // start loader
    try {
      await generateContract(formData);
      fetchContracts();
      setView("list");
    } catch (err) {
      setError('Failed to save contract');
    } finally {
      setSaving(false); // stop loader
    }
  }

  async function handleDownloadContract(id) {
    const url = await downloadContract(id);
    window.open(url, '_blank');
  }

  async function handleDeleteContract(id) {
    if (!window.confirm("Are you sure you want to delete this contract?")) return;
    setLoading(true);
    try {
      await deleteContract(id);
      setContracts(prev => prev.filter(c => c._id !== id));
      setSelected(null); // clear selected
      setView("list");
      alert("Contract deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete contract.");
    } finally {
      setLoading(false);
    }
  }

  if (view === "detail" && selected) {
    return (
      <ContractDetail
        contract={selected}
        onBack={() => setView("list")}
        onEdit={() => setView("edit")}
        onDelete={handleDeleteContract}
        loading={loading}
      />
    );
  }

  if (view === "edit" && selected) {
    return (
      <ContractForm
        key={selected._id}
        contract={selected}
        onBack={() => setView("detail")}
        onSave={handleSaveContract}
        saving={saving} // <-- pass saving state
      />
    );
  }

  if (view === "add") {
    return (
      <ContractForm
        onBack={() => setView("list")}
        onSave={handleSaveContract}
        saving={saving} // <-- pass saving state
      />
    );
  }
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <ContractList
        contracts={contracts}
        onSelect={c => { setSelected(c); setView("detail"); }}
        onAdd={() => setView("add")}
        onDownload={handleDownloadContract}
      />
      {loading && <Loader />}
    </>
  );
};


export default Contracts;
