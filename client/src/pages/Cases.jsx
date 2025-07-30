import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getCases, createCase, updateCase, deleteCase, uploadCaseFile } from '../services/cases';
import { formatDate } from '../utils/dateUtils';
import api from '../services/api';
import Loader from '../components/Loader';

const statuses = ['Open', 'In Progress', 'Closed'];
const caseworkers = ['Sarah Brown', 'Mike Green', 'Jane Lee'];
const individuals = ['Alice Johnson', 'Bob Smith'];
const caseTypes = ['Support', 'Advocacy', 'Training', 'Other'];

const statusColors = {
  active: 'bg-green-100 text-[#2EAB2C]',
  open: 'bg-green-100 text-[#2EAB2C]',
  'in progress': 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
};

const genderOptions = ['Male', 'Female', 'Other'];
const riskLevels = ['Low', 'Medium', 'High'];
const statusOptions = [
  'New',
  'Awaiting Assessment',
  'Active',
  'Paused',
  'Escalated',
  'Closed – Resolved',
  'Closed – Unresolved'
];

const CaseList = ({ onSelect, onAdd, cases, onDelete, staffList }) => {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  // Filter: if caseworker, only show assigned cases
  const filteredCases = cases.filter(c => {
    if (user?.role === 'caseworker') {
      return (c.assignedCaseworkers || []).some(cw => cw.userId === user._id);
    }
    return true;
  }).filter(c =>
    (c.clientFullName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.caseReferenceNumber || '').toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search by client or reference..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        {['admin', 'manager', 'caseworker'].includes(user?.role) && (
          <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Case</button>
        )}
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Reference</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Risk</th>
              <th className="px-4 py-2">Caseworkers</th>
              <th className="px-4 py-2">Opened</th>
              <th className="px-4 py-2"></th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-mono text-xs">{c.caseReferenceNumber}</td>
                <td className="px-4 py-2 font-semibold">{c.clientFullName}</td>
                <td className="px-4 py-2">{c.caseType}</td>
                <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[c.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{c.status}</span></td>
                <td className="px-4 py-2">{c.riskLevel}</td>
                <td className="px-4 py-2">{(c.assignedCaseworkers || []).map(cw => {
                  const staff = staffList.find(s => s._id === cw.userId);
                  return <span key={cw.userId} className={cw.isLead ? 'font-bold' : ''}>{staff ? staff.name : cw.userId}{cw.isLead ? ' (Lead)' : ''}<br /></span>;
                })}</td>
                <td className="px-4 py-2">{formatDate(c.keyDates?.opened)}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(c)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
                {/* <td className="px-4 py-2">{['admin','manager'].includes(user.user?.role) && (<button onClick={() => onDelete(c)} className="px-3 py-1 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button>)}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CaseDetail = ({ caseItem, onBack, onEdit, staffList }) => {
  const { user } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <div className="mb-6 p-4 rounded bg-green-50 border border-green-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-bold mb-1">Case Reference: {caseItem.caseReferenceNumber}</div>
          <div className="text-xl font-bold text-[#2EAB2C]">{caseItem.clientFullName}</div>
        </div>
        <div className="mt-2 md:mt-0">
          <span className={`px-3 py-1 rounded text-sm font-semibold ${statusColors[caseItem.status?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{caseItem.status}</span>
        </div>
      </div>
      {/* Carer Details */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">Carer Details</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">Carer Name:</span> {caseItem.clientFullName}</div>
          <div><span className="font-semibold">Carer Email:</span> {caseItem.contactInfo?.email}</div>
          <div><span className="font-semibold">Carer Contact Number:</span> {caseItem.contactInfo?.phone}</div>
          <div><span className="font-semibold">Date of Birth:</span> {caseItem.dateOfBirth ? formatDate(caseItem.dateOfBirth) : '-'}</div>
          <div><span className="font-semibold">Gender:</span> {caseItem.gender}</div>
          <div><span className="font-semibold">Ethnicity:</span> {caseItem.ethnicity}</div>
        </div>
      </div>
      {/* Referrer Details */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">Referrer Details</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">Referrer Name:</span> {caseItem.referralSource}</div>
          <div><span className="font-semibold">Organization:</span> {caseItem.organization}</div>
          <div><span className="font-semibold">Referrer Contact Number:</span> {caseItem.referrerContactNumber}</div>
          <div><span className="font-semibold">Referrer Email:</span> {caseItem.referrerEmail}</div>
        </div>
      </div>
      {/* SSW Details */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">SSW Details</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">SSW Name:</span> {caseItem.referralDetails?.sswName}</div>
          <div><span className="font-semibold">SSW Contact Number:</span> {caseItem.referralDetails?.sswContactNumber}</div>
          <div><span className="font-semibold">SSW Email:</span> {caseItem.referralDetails?.sswEmail}</div>
          <div><span className="font-semibold">SSW Local Authority:</span> {caseItem.referralDetails?.sswLocalAuthority}</div>
        </div>
      </div>
      {/* Decision Maker */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">Decision Maker</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">Decision Maker Name:</span> {caseItem.referralDetails?.decisionMakerName}</div>
          <div><span className="font-semibold">Decision Maker Contact Number:</span> {caseItem.referralDetails?.decisionMakerContactNumber}</div>
          <div><span className="font-semibold">Decision Maker Email:</span> {caseItem.referralDetails?.decisionMakerEmail}</div>
        </div>
      </div>
      {/* Finance Contact */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">Finance Contact</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">Finance Contact Name:</span> {caseItem.referralDetails?.financeContactName}</div>
          <div><span className="font-semibold">Finance Contact Number:</span> {caseItem.referralDetails?.financeContactNumber}</div>
          <div><span className="font-semibold">Finance Email:</span> {caseItem.referralDetails?.financeEmail}</div>
        </div>
      </div>
      {/* Case Information */}
      <div className="mb-4 p-4 rounded bg-gray-50 border border-gray-200">
        <div className="font-semibold text-green-900 mb-2 text-lg">Case Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div><span className="font-semibold">Presenting Issues:</span> {caseItem.presentingIssues}</div>
          <div><span className="font-semibold">Caseworkers:</span> {(caseItem.assignedCaseworkers || []).map(cw => {
            const staff = staffList?.find(s => s._id === cw.userId);
            return <span key={cw.userId} className={cw.isLead ? 'font-bold' : ''}>{staff ? staff.name : cw.userId}{cw.isLead ? ' (Lead)' : ''}<br /></span>;
          })}</div>
          <div><span className="font-semibold">Risk Level:</span> {caseItem.riskLevel}</div>
          <div><span className="font-semibold">Key Dates:</span> Opened: {caseItem.keyDates?.opened ? formatDate(caseItem.keyDates.opened) : '-'} | Review Due: {caseItem.keyDates?.reviewDue ? formatDate(caseItem.keyDates.reviewDue) : '-'} | Closed: {caseItem.keyDates?.closed ? formatDate(caseItem.keyDates.closed) : '-'}</div>
          <div><span className="font-semibold">Notes/Case Summary:</span> {caseItem.notes}</div>
          <div><span className="font-semibold">Outcome Achieved:</span> {caseItem.outcomeAchieved}</div>
          <div><span className="font-semibold">Supporting Documents:</span> <ul className="list-disc ml-6">{(caseItem.supportingDocuments || []).map((doc, i) => <li key={i}><a href={doc.url} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{doc.name}</a></li>)}</ul></div>
          <div><span className="font-semibold">Total Time Logged:</span> {caseItem.totalTimeLogged}</div>
          <div><span className="font-semibold">Invoiceable Hours:</span> {caseItem.invoiceableHours}</div>
        </div>
      </div>
      {['admin', 'manager', 'caseworker'].includes(user.user?.role?.toLowerCase()) && (
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Edit</button>
        </div>
      )}
    </div>
  );
};

const CaseForm = ({ caseItem, onBack, onSave }) => {
  // Main fields
  const [clientFullName, setClientFullName] = useState(caseItem?.clientFullName || "");
  const [dateOfBirth, setDateOfBirth] = useState(caseItem?.dateOfBirth ? caseItem.dateOfBirth.slice(0, 10) : "");
  const [gender, setGender] = useState(caseItem?.gender || "");
  const [ethnicity, setEthnicity] = useState(caseItem?.ethnicity || "");
  const [email, setEmail] = useState(caseItem?.contactInfo?.email || "");
  const [phone, setPhone] = useState(caseItem?.contactInfo?.phone || "");
  const [organization, setOrganization] = useState(caseItem?.organization || "");
  const [referralSource, setReferralSource] = useState(caseItem?.referralSource || "");
  const [caseType, setCaseType] = useState(caseItem?.caseType || "");
  const [presentingIssues, setPresentingIssues] = useState(caseItem?.presentingIssues || "");
  // Caseworkers
  const [assignedCaseworkers, setAssignedCaseworkers] = useState(caseItem?.assignedCaseworkers || []);
  const [newCaseworker, setNewCaseworker] = useState("");
  const [isLead, setIsLead] = useState(false);
  // Risk, status, dates
  const [riskLevel, setRiskLevel] = useState(caseItem?.riskLevel || "");
  const [status, setStatus] = useState(caseItem?.status || "New");
  const [pausedReason, setPausedReason] = useState(caseItem?.pausedReason || "");
  const [opened, setOpened] = useState(caseItem?.keyDates?.opened ? caseItem.keyDates.opened.slice(0, 10) : "");
  const [reviewDue, setReviewDue] = useState(caseItem?.keyDates?.reviewDue ? caseItem.keyDates.reviewDue.slice(0, 10) : "");
  const [closed, setClosed] = useState(caseItem?.keyDates?.closed ? caseItem.keyDates.closed.slice(0, 10) : "");
  // Notes, outcome, time
  const [notes, setNotes] = useState(caseItem?.notes || "");
  const [outcomeAchieved, setOutcomeAchieved] = useState(caseItem?.outcomeAchieved || "");
  const [supportingDocuments, setSupportingDocuments] = useState(caseItem?.supportingDocuments || []);
  const [totalTimeLogged, setTotalTimeLogged] = useState(caseItem?.totalTimeLogged || "00:00");
  const [invoiceableHours, setInvoiceableHours] = useState(caseItem?.invoiceableHours || "00:00");
  // File upload
  const [newDocFile, setNewDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [staffList, setStaffList] = useState([]);

  // Referral Details fields (state)
  const [position, setPosition] = useState(caseItem?.referralDetails?.position || "");
  const [hours, setHours] = useState(caseItem?.referralDetails?.hours || "");
  const [sswName, setSswName] = useState(caseItem?.referralDetails?.sswName || "");
  const [sswContactNumber, setSswContactNumber] = useState(caseItem?.referralDetails?.sswContactNumber || "");
  const [sswEmail, setSswEmail] = useState(caseItem?.referralDetails?.sswEmail || "");
  const [sswLocalAuthority, setSswLocalAuthority] = useState(caseItem?.referralDetails?.sswLocalAuthority || "");
  const [decisionMakerName, setDecisionMakerName] = useState(caseItem?.referralDetails?.decisionMakerName || "");
  const [decisionMakerContactNumber, setDecisionMakerContactNumber] = useState(caseItem?.referralDetails?.decisionMakerContactNumber || "");
  const [decisionMakerEmail, setDecisionMakerEmail] = useState(caseItem?.referralDetails?.decisionMakerEmail || "");
  const [financeContactName, setFinanceContactName] = useState(caseItem?.referralDetails?.financeContactName || "");
  const [financeContactNumber, setFinanceContactNumber] = useState(caseItem?.referralDetails?.financeContactNumber || "");
  const [financeEmail, setFinanceEmail] = useState(caseItem?.referralDetails?.financeEmail || "");
  const backendBaseUrl = "https://crm-backend-0v14.onrender.com";

  useEffect(() => {
    api.get('/users/staff')
      .then(res => setStaffList(res.data))
      .catch(() => setStaffList([]));
  }, []);

  // Add/Remove caseworker
  const addCaseworker = () => {
    if (newCaseworker) {
      setAssignedCaseworkers([...assignedCaseworkers, { userId: newCaseworker, isLead }]);
      setNewCaseworker("");
      setIsLead(false);
    }
  };
  const removeCaseworker = idx => setAssignedCaseworkers(assignedCaseworkers.filter((_, i) => i !== idx));
  const setLead = idx => setAssignedCaseworkers(assignedCaseworkers.map((cw, i) => ({ ...cw, isLead: i === idx })));

  // File upload handler
  const handleUpload = async () => {
    if (newDocFile) {
      setUploading(true);
      setUploadError("");
      try {
        const result = await uploadCaseFile(newDocFile, caseItem?._id);
        setSupportingDocuments([...supportingDocuments, { name: result.name, url: result.url }]);
        setNewDocFile(null);
      } catch (err) {
        setUploadError("File upload failed");
      }
      setUploading(false);
    }
  };
  const removeDocument = idx => setSupportingDocuments(supportingDocuments.filter((_, i) => i !== idx));

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...caseItem,
      clientFullName,
      dateOfBirth,
      gender,
      ethnicity,
      contactInfo: { email, phone },
      organization,
      referralSource,
      caseType,
      presentingIssues,
      assignedCaseworkers,
      riskLevel,
      keyDates: { opened, reviewDue, closed },
      status,
      pausedReason,
      notes,
      outcomeAchieved,
      supportingDocuments,
      totalTimeLogged,
      invoiceableHours,
      referralDetails: {
        position,
        hours,
        sswName,
        sswContactNumber,
        sswEmail,
        sswLocalAuthority,
        decisionMakerName,
        decisionMakerContactNumber,
        decisionMakerEmail,
        financeContactName,
        financeContactNumber,
        financeEmail
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow mt-6">
      <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
      <h2 className="text-xl font-bold mb-4">{caseItem ? "Edit" : "Add"} Case</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Carer Details */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Carer Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">Carer Name</label>
              <input placeholder="Carer Name" value={clientFullName} onChange={e => setClientFullName(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Carer Email</label>
              <input placeholder="Carer Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Carer Contact Number</label>
              <input placeholder="Carer Contact Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Date of Birth</label>
              <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-2 border rounded">
                <option value="">Select Gender</option>
                {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Ethnicity</label>
              <input placeholder="Ethnicity" value={ethnicity} onChange={e => setEthnicity(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* Referrer Details */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Referrer Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">Referrer Name</label>
              <input placeholder="Referrer Name" value={referralSource} onChange={e => setReferralSource(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Organization</label>
              <input placeholder="Organization" value={organization} onChange={e => setOrganization(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Referrer Contact Number</label>
              <input placeholder="Referrer Contact Number" value={caseItem?.referrerContactNumber || ""} onChange={e => setReferralContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Referrer Email</label>
              <input placeholder="Referrer Email" value={caseItem?.referrerEmail || ""} onChange={e => setReferralEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* SSW Details */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">SSW Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">SSW Name</label>
              <input placeholder="SSW Name" value={sswName} onChange={e => setSswName(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">SSW Contact Number</label>
              <input placeholder="SSW Contact Number" value={sswContactNumber} onChange={e => setSswContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">SSW Email</label>
              <input placeholder="SSW Email" value={sswEmail} onChange={e => setSswEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">SSW Local Authority</label>
              <input placeholder="SSW Local Authority" value={sswLocalAuthority} onChange={e => setSswLocalAuthority(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* Decision Maker */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Decision Maker</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">Decision Maker Name</label>
              <input placeholder="Decision Maker Name" value={decisionMakerName} onChange={e => setDecisionMakerName(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Decision Maker Contact Number</label>
              <input placeholder="Decision Maker Contact Number" value={decisionMakerContactNumber} onChange={e => setDecisionMakerContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Decision Maker Email</label>
              <input placeholder="Decision Maker Email" value={decisionMakerEmail} onChange={e => setDecisionMakerEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* Finance Contact */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Finance Contact</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">Finance Contact Name</label>
              <input placeholder="Finance Contact Name" value={financeContactName} onChange={e => setFinanceContactName(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Finance Contact Number</label>
              <input placeholder="Finance Contact Number" value={financeContactNumber} onChange={e => setFinanceContactNumber(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Finance Email</label>
              <input placeholder="Finance Email" value={financeEmail} onChange={e => setFinanceEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* Case Information */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Case Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <label className="block font-semibold mb-1">Presenting Issues</label>
              <input placeholder="Presenting Issues" value={presentingIssues} onChange={e => setPresentingIssues(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Risk Level</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full px-4 py-2 border rounded">
                <option value="">Select Risk Level</option>
                {riskLevels.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded">
                <option value="">Select Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Paused Reason</label>
              <input placeholder="Paused Reason" value={pausedReason} onChange={e => setPausedReason(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Opened</label>
              <input type="date" value={opened} onChange={e => setOpened(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Review Due</label>
              <input type="date" value={reviewDue} onChange={e => setReviewDue(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Closed</label>
              <input type="date" value={closed} onChange={e => setClosed(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Notes/Case Summary</label>
              <textarea placeholder="Notes/Case Summary" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Outcome Achieved</label>
              <input placeholder="Outcome Achieved" value={outcomeAchieved} onChange={e => setOutcomeAchieved(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Total Time Logged (hh:mm)</label>
              <input placeholder="Total Time Logged (hh:mm)" value={totalTimeLogged} onChange={e => setTotalTimeLogged(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Invoiceable Hours (hh:mm)</label>
              <input placeholder="Invoiceable Hours (hh:mm)" value={invoiceableHours} onChange={e => setInvoiceableHours(e.target.value)} className="w-full px-4 py-2 border rounded" />
            </div>
          </div>
        </div>
        {/* Assigned Caseworkers */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Assigned Caseworkers</div>
          <ul className="mb-2">
            {assignedCaseworkers.map((cw, i) => {
              const staff = staffList.find(s => s._id === cw.userId);
              return (
                <li key={i} className="flex items-center gap-2 text-sm mb-1">
                  <span>{staff ? staff.name : cw.userId}{cw.isLead ? ' (Lead)' : ''}</span>
                  <button type="button" className="text-blue-500 ml-2" onClick={() => setLead(i)}>Set Lead</button>
                  <button type="button" className="text-red-500 ml-2" onClick={() => removeCaseworker(i)}>Remove</button>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2 mb-2">
            <select value={newCaseworker} onChange={e => setNewCaseworker(e.target.value)} className="px-2 py-1 border rounded w-1/2">
              <option value="">Select Caseworker</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>{staff.name} ({staff.role})</option>
              ))}
            </select>
            <label className="flex items-center gap-1"><input type="checkbox" checked={isLead} onChange={e => setIsLead(e.target.checked)} /> Lead</label>
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={addCaseworker}>Add</button>
          </div>
        </div>
        {/* Supporting Documents */}
        <div className="p-4 rounded bg-gray-50 border border-gray-200 mb-2">
          <div className="font-semibold text-green-900 mb-2 text-lg">Supporting Documents</div>
          <ul className="mb-2">
            {supportingDocuments.map((doc, i) => (
              <li key={i} className="flex items-center gap-2 text-sm mb-1">
                <span><a href={backendBaseUrl + doc.url} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">{doc.name}</a></span>
                <button type="button" className="text-red-500 ml-2" onClick={() => removeDocument(i)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 items-center mb-2">
            <input type="file" onChange={e => setNewDocFile(e.target.files[0])} className="px-2 py-1 border rounded w-1/2" />
            <button type="button" className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Add'}</button>
          </div>
          {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}
        </div>
        <button type="submit" className="w-full bg-[#2EAB2C] text-white py-2 rounded hover:bg-green-800 font-semibold">{caseItem ? "Save" : "Add"}</button>
      </form>
    </div>
  );
};

const CaseEditForm = ({ caseItem, onBack, onSave }) => {
  return <CaseForm caseItem={caseItem} onBack={onBack} onSave={onSave} />;
};

const Cases = () => {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    api.get('/users/staff')
      .then(res => setStaffList(res.data))
      .catch(() => setStaffList([]));
  }, []);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCases();
      setCases(data);
    } catch (err) {
      setError("Failed to load cases");
    }
    setLoading(false);
  }

  async function handleSaveCase(caseData) {
    try {
      if (caseData._id) {
        await updateCase(caseData._id, caseData);
      } else {
        await createCase(caseData);
      }
      fetchCases();
      setView("list");
      setSelected(null);
    } catch (err) {
      setError("Failed to save case");
    }
  }

  async function handleDeleteCase(caseItem) {
    if (!window.confirm("Are you sure you want to delete this case?")) return;
    try {
      await deleteCase(caseItem._id);
      fetchCases();
      setView("list");
      setSelected(null);
    } catch (err) {
      setError("Failed to delete case");
    }
  }

  if (loading) return <Loader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (view === "edit") {
    return <CaseEditForm caseItem={selected} onBack={() => { setView("detail"); setEditMode(false); }} onSave={data => { handleSaveCase(data); setView("detail"); setEditMode(false); }} />;
  }
  if (view === "detail") {
    return <>
      <CaseDetail caseItem={selected} staffList={staffList} onBack={() => { setView("list"); setSelected(null); }} onEdit={() => { setView("edit"); setEditMode(true); }} />
      {['admin', 'manager'].includes(user.user?.role?.toLowerCase()) && (
        <div className="max-w-2xl mx-auto mt-2 text-right">
          <button onClick={() => handleDeleteCase(selected)} className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-700">Delete Case</button>
        </div>
      )}
    </>;
  }
  return <CaseList onSelect={c => { setSelected(c); setView("detail"); }} onAdd={() => { setSelected(null); setView("form"); }} cases={cases} onDelete={handleDeleteCase} staffList={staffList} />;
};

export default Cases;
