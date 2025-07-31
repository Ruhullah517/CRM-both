import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  EyeIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import { getFreelancers, createFreelancer, updateFreelancer, deleteFreelancer } from '../services/freelancers';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/Loader';

const roles = ['Trainer', 'Mentor'];
const statuses = ['Active', 'Inactive'];
const availabilities = ['Available', 'Unavailable'];

const statusColors = {
  Active: 'bg-green-100 text-[#2EAB2C]',
  Inactive: 'bg-gray-200 text-gray-800',
};
const availabilityColors = {
  available: 'bg-green-100 text-[#2EAB2C]',
  unavailable: 'bg-yellow-100 text-yellow-800',
};

const FreelancerList = ({ onSelect, onAdd, freelancers, onDelete }) => {
  const [search, setSearch] = useState("");
  const filtered = freelancers.filter(f => f.fullName?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input placeholder="Search freelancers..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded w-full sm:w-64" />
        <button onClick={onAdd} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800 transition">Add Freelancer</button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-green-50">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Geographical Location</th>
              <th className="px-4 py-2">Mobile</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f._id} className="border-t hover:bg-green-50 transition">
                <td className="px-4 py-2 font-semibold">{f.fullName}</td>
                <td className="px-4 py-2">{f.email}</td>
                <td className="px-4 py-2">{f.role}</td>
                <td className="px-4 py-2">{f.geographicalLocation}</td>
                <td className="px-4 py-2">{f.mobileNumber}</td>
                <td className="px-4 py-2"><button onClick={() => onSelect(f)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FreelancerDetail = ({ freelancer, onBack, onEdit, onDelete, backendBaseUrl }) => (
  <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-6">
    <button onClick={onBack} className="mb-4 text-[#2EAB2C] hover:underline">&larr; Back</button>
    <h2 className="text-2xl font-bold mb-4 text-[#2EAB2C]">{freelancer.fullName}</h2>
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {freelancer.email}</div>
        <div className="mb-2"><span className="font-semibold">Mobile:</span> {freelancer.mobileNumber}</div>
        <div className="mb-2"><span className="font-semibold">Home Address:</span> {freelancer.homeAddress}</div>
        <div className="mb-2"><span className="font-semibold">Geographical Location:</span> {freelancer.geographicalLocation}</div>
        <div className="mb-2"><span className="font-semibold">Role:</span> {freelancer.role}</div>
        <div className="mb-2"><span className="font-semibold">Miles Willing to Travel:</span> {freelancer.milesWillingToTravel}</div>
        <div className="mb-2"><span className="font-semibold">On WhatsApp:</span> {freelancer.isOnWhatsApp ? 'Yes' : 'No'}</div>
      </div>
      <div>
        <div className="mb-2"><span className="font-semibold">Social Work England Registration:</span> {freelancer.hasSocialWorkEnglandRegistration ? 'Yes' : 'No'}</div>
        {freelancer.hasSocialWorkEnglandRegistration && (
          <div className="mb-2"><span className="font-semibold">Registration Number:</span> {freelancer.socialWorkEnglandRegistrationNumber}</div>
        )}
        <div className="mb-2"><span className="font-semibold">DBS Check:</span> {freelancer.hasDBSCheck ? 'Yes' : 'No'}</div>
        <div className="mb-2"><span className="font-semibold">On Update System:</span> {freelancer.isOnUpdateSystem ? 'Yes' : 'No'}</div>
        {freelancer.dbsCertificateUrl && (
          <div className="mb-2"><span className="font-semibold">DBS Certificate:</span> <a href={backendBaseUrl + freelancer.dbsCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">View File</a></div>
        )}
      </div>
    </div>
    <div className="mb-6">
      <div className="mb-2"><span className="font-semibold">Form F Assessment Experience:</span> {freelancer.hasFormFAssessmentExperience ? 'Yes' : 'No'}</div>
      {freelancer.hasFormFAssessmentExperience && (
        <div className="mb-2"><span className="font-semibold">Years of Experience:</span> {freelancer.formFAssessmentExperienceYears}</div>
      )}
      <div className="mb-2"><span className="font-semibold">Other Social Work Assessment Experience:</span> {(freelancer.otherSocialWorkAssessmentExperience || []).join(', ')}</div>
      <div className="mb-2"><span className="font-semibold">Consideration For:</span> {(freelancer.considerationFor || []).join(', ')}</div>
      <div className="mb-2"><span className="font-semibold">Qualifications & Training:</span> {freelancer.qualificationsAndTraining}</div>
      <div className="mb-2"><span className="font-semibold">Additional Info:</span> {freelancer.additionalInfo}</div>
      <div className="mb-2"><span className="font-semibold">Professional References:</span> {freelancer.professionalReferences}</div>
      {freelancer.cvUrl && (
        <div className="mb-2"><span className="font-semibold">CV:</span> <a href={backendBaseUrl + freelancer.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">View File</a></div>
      )}
      <div className="mb-2"><span className="font-semibold">Payment Preference:</span> {freelancer.paymentPreferences}</div>
      {freelancer.paymentOther && (
        <div className="mb-2"><span className="font-semibold">Other Payment:</span> {freelancer.paymentOther}</div>
      )}
    </div>
    <div className="flex gap-2 mt-4">
      <button onClick={onEdit} className="px-4 py-2 rounded bg-[#2EAB2C] text-white font-semibold hover:bg-green-800">Update</button>
      <button onClick={() => onDelete(freelancer)} className="px-4 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200">Delete</button>
    </div>
  </div>
);

function formatDateForInput(date) {
  if (!date) return '';
  // If already in YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Try to parse and format
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
}

const FreelancerForm = ({ freelancer, onBack, onSave, loading }) => {
  const [form, setForm] = useState({
    _id: freelancer?._id || undefined,
    // Section 1: Personal Information
    fullName: freelancer?.fullName || '',
    homeAddress: freelancer?.homeAddress || '',
    email: freelancer?.email || '',
    mobileNumber: freelancer?.mobileNumber || '',
    isOnWhatsApp: freelancer?.isOnWhatsApp || false,

    // Section 2: Professional Information
    hasSocialWorkEnglandRegistration: freelancer?.hasSocialWorkEnglandRegistration || false,
    socialWorkEnglandRegistrationNumber: freelancer?.socialWorkEnglandRegistrationNumber || '',
    hasDBSCheck: freelancer?.hasDBSCheck || false,
    isOnUpdateSystem: freelancer?.isOnUpdateSystem || false,
    dbsCertificateFile: null,
    dbsCertificateUrl: freelancer?.dbsCertificateUrl || '',

    // Section 3: Location & Availability
    currentLocation: freelancer?.currentLocation || '',
    geographicalLocation: freelancer?.geographicalLocation || '',
    role: freelancer?.role || '',
    milesWillingToTravel: freelancer?.milesWillingToTravel || '',

    // Section 4: Work Experience & Skills
    hasFormFAssessmentExperience: freelancer?.hasFormFAssessmentExperience || false,
    formFAssessmentExperienceYears: freelancer?.formFAssessmentExperienceYears || '',
    otherSocialWorkAssessmentExperience: (() => {
      if (Array.isArray(freelancer?.otherSocialWorkAssessmentExperience)) {
        if (
          freelancer.otherSocialWorkAssessmentExperience.length === 1 &&
          typeof freelancer.otherSocialWorkAssessmentExperience[0] === 'string' &&
          freelancer.otherSocialWorkAssessmentExperience[0].startsWith('[')
        ) {
          return JSON.parse(freelancer.otherSocialWorkAssessmentExperience[0]);
        }
        return freelancer.otherSocialWorkAssessmentExperience;
      }
      if (
        typeof freelancer?.otherSocialWorkAssessmentExperience === 'string' &&
        freelancer.otherSocialWorkAssessmentExperience.startsWith('[')
      ) {
        return JSON.parse(freelancer.otherSocialWorkAssessmentExperience);
      }
      return [];
    })(),

    // Section 5: Consideration for Work & Training
    considerationFor: (() => {
      if (Array.isArray(freelancer?.considerationFor)) {
        if (
          freelancer.considerationFor.length === 1 &&
          typeof freelancer.considerationFor[0] === 'string' &&
          freelancer.considerationFor[0].startsWith('[')
        ) {
          return JSON.parse(freelancer.considerationFor[0]);
        }
        return freelancer.considerationFor;
      }
      if (
        typeof freelancer?.considerationFor === 'string' &&
        freelancer.considerationFor.startsWith('[')
      ) {
        return JSON.parse(freelancer.considerationFor);
      }
      return [];
    })(),

    // Section 6: Additional Information
    qualificationsAndTraining: freelancer?.qualificationsAndTraining || '',
    additionalInfo: freelancer?.additionalInfo || '',
    professionalReferences: freelancer?.professionalReferences || '',
    cvFile: null,
    cvUrl: freelancer?.cvUrl || '',

    // Section 7: Payment & Tax Information
    paymentPreferences: Array.isArray(freelancer?.paymentPreferences)
      ? freelancer.paymentPreferences[0] || ''
      : (freelancer?.paymentPreferences || ''),
    paymentOther: freelancer?.paymentOther || '',
  });

  // Options for select/multiselect fields
  const geoOptions = [
    'North East', 'North West', 'East Midlands', 'West Midlands', 'South East', 'South West', 'London', 'Other', 'Wales', 'Scotland'
  ];
  const roleOptions = [
    'Foster Carer', 'Kinship Carer', 'SGO', 'Interested in Fostering', 'Social Worker', 'Other'
  ];
  const assessmentOptions = [
    'Fostering Panel Work', 'Adoption Assessments', 'Kinship Care Assessments', 'Special Guardianship Order (SGO) Assessments', 'Court Report Writing', 'Child Protection & Safeguarding', 'Standard of Care investigation'
  ];
  const considerationOptions = [
    'Form F Assessments', 'Other Social Work Assessments', 'Delivery Training', 'Initial Home Visit'
  ];
  const paymentOptions = [
    'Through an umbrella company - we can refer', 'Self-employed (invoice directly)', 'Limited company (invoice through my company)', 'Other:'
  ];

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleArrayCheckboxChange(name, option) {
    setForm(f => {
      const arr = f[name] || [];
      if (arr.includes(option)) {
        return { ...f, [name]: arr.filter(o => o !== option) };
      } else {
        return { ...f, [name]: [...arr, option] };
      }
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form); // Send the full form, including file objects
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg mt-8">
      <button onClick={onBack} className="mb-6 text-[#2EAB2C] hover:underline font-semibold">&larr; Back</button>
      <h2 className="text-3xl font-extrabold mb-8 text-center text-[#2EAB2C] tracking-tight drop-shadow">{freelancer ? "Edit" : "Add"} Freelancer</h2>
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Personal Information</h3>
          <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" required />
          <input name="homeAddress" placeholder="Home Address" value={form.homeAddress} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <input name="mobileNumber" placeholder="Mobile Number" value={form.mobileNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Are you on WhatsApp?</span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnWhatsApp"
                value="true"
                checked={form.isOnWhatsApp === true}
                onChange={() => setForm(f => ({ ...f, isOnWhatsApp: true }))}
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnWhatsApp"
                value="false"
                checked={form.isOnWhatsApp === false}
                onChange={() => setForm(f => ({ ...f, isOnWhatsApp: false }))}
                className="accent-green-600"
              />
              No
            </label>
          </div>
        </div>
        {/* Section 2: Professional Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Professional Information</h3>
          {/* Social Work England Registration */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have a Social Work England Registration? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasSocialWorkEnglandRegistration"
                value="false"
                checked={form.hasSocialWorkEnglandRegistration === false}
                onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: false, socialWorkEnglandRegistrationNumber: '' }))}
                required
                className="accent-green-600"
              />
              No
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasSocialWorkEnglandRegistration"
                value="true"
                checked={form.hasSocialWorkEnglandRegistration === true}
                onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
          </div>
          {form.hasSocialWorkEnglandRegistration === true && (
            <input
              name="socialWorkEnglandRegistrationNumber"
              placeholder="Social Work England Registration Number"
              value={form.socialWorkEnglandRegistrationNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded mb-2"
              required
            />
          )}
          {/* DBS Check */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have a DBS Check? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasDBSCheck"
                value="true"
                checked={form.hasDBSCheck === true}
                onChange={() => setForm(f => ({ ...f, hasDBSCheck: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasDBSCheck"
                value="false"
                checked={form.hasDBSCheck === false}
                onChange={() => setForm(f => ({ ...f, hasDBSCheck: false, isOnUpdateSystem: false, dbsCertificateFile: null }))}
                required
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {/* Update System */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Are you on the update system?</span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnUpdateSystem"
                value="true"
                checked={form.isOnUpdateSystem === true}
                onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: true }))}
                disabled={form.hasDBSCheck !== true}
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="isOnUpdateSystem"
                value="false"
                checked={form.isOnUpdateSystem === false}
                onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: false, dbsCertificateFile: null }))}
                disabled={form.hasDBSCheck !== true}
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {form.dbsCertificateUrl && (
            <div className="mb-2">
              <a href={form.dbsCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                View current DBS Certificate
              </a>
            </div>
          )}
          {form.hasDBSCheck === true && form.isOnUpdateSystem === true && (
            <div className="mb-2">
              <label className="block mb-1">Upload new DBS Certification (optional)</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center px-4 py-2 bg-green-100 text-[#2EAB2C] font-semibold rounded-lg shadow cursor-pointer hover:bg-green-200 transition border border-green-300">
                  <PaperClipIcon className="w-5 h-5 mr-2" />
                  {form.dbsCertificateFile ? 'Change file' : 'Choose file'}
                  <input
                    type="file"
                    name="dbsCertificateFile"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleChange}
                    className="hidden accent-green-600"
                  />
                </label>
                {form.dbsCertificateFile && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">{form.dbsCertificateFile.name}</span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Section 3: Location & Availability */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Location & Availability</h3>
          <input name="currentLocation" placeholder="Current Location (City & County)" value={form.currentLocation} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          {/* Geographical Location */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Geographical Location</span>
            <div className="flex flex-col gap-1">
              {geoOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="radio"
                    name="geographicalLocation"
                    value={opt}
                    checked={form.geographicalLocation === opt}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {/* Role */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Role</span>
            <div className="flex flex-col gap-1">
              {roleOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="radio"
                    name="role"
                    value={opt}
                    checked={form.role === opt}
                    onChange={handleChange}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          {/* Miles Willing to Travel for Training */}
          <label className="block mb-1">Miles Willing to Travel for Training <span className="text-red-600 font-bold">*</span></label>
          <select
            name="milesWillingToTravel"
            value={form.milesWillingToTravel}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded mb-2"
            required
          >
            <option value="" disabled>Select...</option>
            <option value="upto 10 miles">upto 10 miles</option>
            <option value="10-20 miles">10-20 miles</option>
            <option value="20-50 miles">20-50 miles</option>
            <option value="50+ miles">50+ miles</option>
            <option value="nationwide">nationwide</option>
          </select>
        </div>
        {/* Section 4: Work Experience & Skills */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Work Experience & Skills</h3>
          {/* Form F Assessments Experience */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have experience in Form F Assessments? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasFormFAssessmentExperience"
                value="true"
                checked={form.hasFormFAssessmentExperience === true}
                onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: true }))}
                required
                className="accent-green-600"
              />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input
                type="radio"
                name="hasFormFAssessmentExperience"
                value="false"
                checked={form.hasFormFAssessmentExperience === false}
                onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: false, formFAssessmentExperienceYears: '' }))}
                required
                className="accent-green-600"
              />
              No
            </label>
          </div>
          {form.hasFormFAssessmentExperience === true && (
            <div className="mb-2">
              <label className="block mb-1">If yes, how many years of experience? <span className="text-red-600 font-bold">*</span></label>
              <select
                name="formFAssessmentExperienceYears"
                value={form.formFAssessmentExperienceYears}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded mb-2"
                required
              >
                <option value="" disabled>Select...</option>
                <option value="0-1 years">0-1 years</option>
                <option value="2-5 years">2-5 years</option>
                <option value="6-10 years">6-10 years</option>
              </select>
            </div>
          )}
          {/* Other Social Work Assessment Experience */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Other Social Work Assessment Experience</span>
            <div className="flex flex-col gap-1">
              {assessmentOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={form.otherSocialWorkAssessmentExperience.includes(opt)}
                    onChange={() => handleArrayCheckboxChange('otherSocialWorkAssessmentExperience', opt)}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Section 5: Consideration for Work & Training */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Consideration for Work & Training</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="block mb-2 font-bold text-base mt-4">What do you want to be considered for?
            </span>
            <div className="flex flex-col gap-1">
              {considerationOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={form.considerationFor.includes(opt)}
                    onChange={() => handleArrayCheckboxChange('considerationFor', opt)}
                    className="accent-green-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Section 6: Additional Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Additional Information</h3>
          <textarea name="qualificationsAndTraining" placeholder="Relevant Qualifications & Training" value={form.qualificationsAndTraining} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <textarea name="additionalInfo" placeholder="Any other information you’d like to share?" value={form.additionalInfo} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          <textarea name="professionalReferences" placeholder="Professional References (Name, Contact, Relationship)" value={form.professionalReferences} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          {form.cvUrl && (
            <div className="mb-2">
              <a href={form.cvUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                View current CV
              </a>
            </div>
          )}
          <div className="mb-2">
            <label className="block mb-1">Upload new CV (optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-green-100 text-[#2EAB2C] font-semibold rounded-lg shadow cursor-pointer hover:bg-green-200 transition border border-green-300">
                <PaperClipIcon className="w-5 h-5 mr-2" />
                {form.cvFile ? 'Change file' : 'Choose file'}
                <input
                  type="file"
                  name="cvFile"
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                  className="hidden accent-green-600"
                />
              </label>
              {form.cvFile && (
                <span className="text-sm text-gray-700 truncate max-w-xs">{form.cvFile.name}</span>
              )}
            </div>
          </div>
        </div>
        {/* Section 7: Payment & Tax Information */}
        <div className="bg-white rounded-xl shadow p-6 mb-2 border-t-4 border-[#2EAB2C]">
          <h3 className="text-xl font-bold mb-4 text-[#2EAB2C] flex items-center gap-2"><span className="inline-block w-2 h-2 bg-[#2EAB2C] rounded-full"></span>Payment & Tax Information</h3>
          <div className="flex flex-col gap-2 mb-2">
            {paymentOptions.map(opt => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentPreferences"
                  value={opt}
                  checked={form.paymentPreferences === opt}
                  onChange={handleChange}
                  className="accent-green-600"
                />
                {opt}
              </label>
            ))}
          </div>
          {form.paymentPreferences === 'Other:' && (
            <input name="paymentOther" placeholder="Other payment preference" value={form.paymentOther} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#2EAB2C] to-green-600 text-white py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 font-extrabold text-lg tracking-wide transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : (freelancer ? "Save" : "Add")}
        </button>
      </form>
    </div>
  );
};

const Freelancers = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';
  const isFreelancer = user?.role === 'freelancer';
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const backendBaseUrl = "https://crm-backend-0v14.onrender.com";

  // --- Send Form Online modal state ---
  const [showSendFormModal, setShowSendFormModal] = useState(false);
  const [sendFormEmail, setSendFormEmail] = useState("");
  const [sendFormStatus, setSendFormStatus] = useState("");
  const [sendFormLoading, setSendFormLoading] = useState(false);

  const handleSendForm = async (e) => {
    e.preventDefault();
    setSendFormLoading(true);
    setSendFormStatus("");
    try {
      const res = await fetch(`${backendBaseUrl}/api/freelancers/send-form-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sendFormEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendFormStatus('Form link sent successfully!');
        setSendFormEmail("");
      } else {
        setSendFormStatus(data.message || 'Failed to send form link.');
      }
    } catch (err) {
      setSendFormStatus('Error sending form link.');
    }
    setSendFormLoading(false);
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  async function fetchFreelancers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getFreelancers();
      // Parse assignments and uploads if needed
      const parsed = data.map(f => ({
        ...f,
        assignments: typeof f.assignments === 'string' ? JSON.parse(f.assignments) : (f.assignments || []),
        uploads: typeof f.uploads === 'string' ? JSON.parse(f.uploads) : (f.uploads || []),
        otherSocialWorkAssessmentExperience: typeof f.otherSocialWorkAssessmentExperience === 'string'
          ? JSON.parse(f.otherSocialWorkAssessmentExperience)
          : (f.otherSocialWorkAssessmentExperience || []),
        considerationFor: typeof f.considerationFor === 'string'
          ? JSON.parse(f.considerationFor)
          : (f.considerationFor || []),
        paymentPreferences: typeof f.paymentPreferences === 'string' && f.paymentPreferences.startsWith('[')
          ? JSON.parse(f.paymentPreferences)
          : f.paymentPreferences,
      }));
      setFreelancers(parsed);
    } catch (err) {
      setError('Failed to load freelancers');
    }
    setLoading(false);
  }

  async function handleSaveFreelancer(freelancer) {
    setSaving(true);
    setError(null);
    console.log(freelancer);
    try {
      if (freelancer._id) {
        await updateFreelancer(freelancer._id, freelancer);
      } else {
        await createFreelancer(freelancer);
      }
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to save freelancer');
    }
    setSaving(false);
  }

  async function handleDeleteFreelancer(freelancer) {
    if (!window.confirm(`Delete freelancer '${freelancer.fullName}'?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteFreelancer(freelancer._id);
      fetchFreelancers();
      setView("list");
    } catch (err) {
      setError('Failed to delete freelancer');
    }
    setSaving(false);
  }

  if (view === "detail" && selected) return <FreelancerDetail freelancer={selected} onBack={() => setView("list")} onEdit={() => setView("edit")} onDelete={handleDeleteFreelancer} backendBaseUrl={backendBaseUrl} />;
  if (view === "edit" && selected) return <FreelancerForm freelancer={selected} onBack={() => setView("detail")} onSave={handleSaveFreelancer} loading={saving} />;
  if (view === "add") return <FreelancerForm onBack={() => setView("list")} onSave={handleSaveFreelancer} loading={saving} />;
  return (
    <>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {/* --- Send Form Online Button --- */}
      <div className="max-w-5xl mx-auto p-4 flex justify-end">
        <button
          onClick={() => setShowSendFormModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Send Form Online
        </button>
      </div>
      {/* --- Modal --- */}
      {showSendFormModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-bold mb-2">Send Freelancer Form</h2>
            <form onSubmit={handleSendForm}>
              <input
                type="email"
                placeholder="Freelancer Email"
                value={sendFormEmail}
                onChange={e => setSendFormEmail(e.target.value)}
                required
                className="border p-2 mb-2 w-full rounded"
              />
              <div className="flex gap-2 mb-2">
                <button type="submit" disabled={sendFormLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
                  {sendFormLoading ? 'Sending...' : 'Send'}
                </button>
                <button type="button" onClick={() => { setShowSendFormModal(false); setSendFormStatus(""); setSendFormEmail(""); }} className="bg-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </form>
            {sendFormStatus && <div className="mt-2 text-green-600">{sendFormStatus}</div>}
          </div>
        </div>
      )}
      <FreelancerList onSelect={f => { setSelected(f); setView("detail"); }} onAdd={() => setView("add")} freelancers={freelancers} onDelete={handleDeleteFreelancer} />
      {loading && <Loader />}
    </>
  );
};

export default Freelancers;
