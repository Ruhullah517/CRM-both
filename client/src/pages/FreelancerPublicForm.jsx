import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SERVER_BASE_URL } from '../config/api';

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

const FreelancerPublicForm = () => {
  const { token } = useParams();
  const [form, setForm] = useState({
    fullName: '',
    homeAddress: '',
    email: '',
    mobileNumber: '',
    isOnWhatsApp: false,
    hasSocialWorkEnglandRegistration: false,
    socialWorkEnglandRegistrationNumber: '',
    hasDBSCheck: false,
    isOnUpdateSystem: false,
    dbsCertificateFile: null,
    dbsCertificateUrl: '',
    currentLocation: '',
    geographicalLocation: '',
    role: '',
    milesWillingToTravel: '',
    hasFormFAssessmentExperience: false,
    formFAssessmentExperienceYears: '',
    otherSocialWorkAssessmentExperience: [],
    considerationFor: [],
    qualificationsAndTraining: '',
    additionalInfo: '',
    professionalReferences: '',
    cvFile: null,
    cvUrl: '',
    paymentPreferences: '',
    paymentOther: '',
    token: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setForm(f => ({ ...f, token }));
    }
  }, [token]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    for (const key in form) {
      if (Array.isArray(form[key])) {
        data.append(key, JSON.stringify(form[key]));
      } else {
        data.append(key, form[key]);
      }
    }
    const res = await fetch(`${SERVER_BASE_URL}/api/freelancers/public`, {
      method: 'POST',
      body: data,
    });
    const result = await res.json();
    setLoading(false);
    if (res.ok) {
      alert('Freelancer submitted successfully!');
    } else {
      alert(result.message || 'Submission failed');
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg mt-8">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-[#2EAB2C] tracking-tight drop-shadow">Freelancer Application Form</h2>
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
              <input type="radio" name="isOnWhatsApp" value="true" checked={form.isOnWhatsApp === true} onChange={() => setForm(f => ({ ...f, isOnWhatsApp: true }))} className="accent-green-600" />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="isOnWhatsApp" value="false" checked={form.isOnWhatsApp === false} onChange={() => setForm(f => ({ ...f, isOnWhatsApp: false }))} className="accent-green-600" />
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
              <input type="radio" name="hasSocialWorkEnglandRegistration" value="false" checked={form.hasSocialWorkEnglandRegistration === false} onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: false, socialWorkEnglandRegistrationNumber: '' }))} required className="accent-green-600" />
              No
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="hasSocialWorkEnglandRegistration" value="true" checked={form.hasSocialWorkEnglandRegistration === true} onChange={() => setForm(f => ({ ...f, hasSocialWorkEnglandRegistration: true }))} required className="accent-green-600" />
              Yes
            </label>
          </div>
          {form.hasSocialWorkEnglandRegistration === true && (
            <input name="socialWorkEnglandRegistrationNumber" placeholder="Social Work England Registration Number" value={form.socialWorkEnglandRegistrationNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" required />
          )}
          {/* DBS Check */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Do you have a DBS Check? <span className="text-red-600 font-bold">*</span></span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="hasDBSCheck" value="true" checked={form.hasDBSCheck === true} onChange={() => setForm(f => ({ ...f, hasDBSCheck: true }))} required className="accent-green-600" />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="hasDBSCheck" value="false" checked={form.hasDBSCheck === false} onChange={() => setForm(f => ({ ...f, hasDBSCheck: false, isOnUpdateSystem: false, dbsCertificateFile: null }))} required className="accent-green-600" />
              No
            </label>
          </div>
          {/* Update System */}
          <div className="mb-2">
            <span className="block mb-2 font-bold text-base mt-4">Are you on the update system?</span>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="isOnUpdateSystem" value="true" checked={form.isOnUpdateSystem === true} onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: true }))} disabled={form.hasDBSCheck !== true} className="accent-green-600" />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="isOnUpdateSystem" value="false" checked={form.isOnUpdateSystem === false} onChange={() => setForm(f => ({ ...f, isOnUpdateSystem: false, dbsCertificateFile: null }))} disabled={form.hasDBSCheck !== true} className="accent-green-600" />
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
                  <span className="mr-2">📎</span>
                  {form.dbsCertificateFile ? 'Change file' : 'Choose file'}
                  <input type="file" name="dbsCertificateFile" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="hidden accent-green-600" />
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
                  <input type="radio" name="geographicalLocation" value={opt} checked={form.geographicalLocation === opt} onChange={handleChange} className="accent-green-600" />
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
                  <input type="radio" name="role" value={opt} checked={form.role === opt} onChange={handleChange} className="accent-green-600" />
                  {opt}
      </label>
              ))}
            </div>
          </div>
          {/* Miles Willing to Travel for Training */}
          <label className="block mb-1">Miles Willing to Travel for Training <span className="text-red-600 font-bold">*</span></label>
          <select name="milesWillingToTravel" value={form.milesWillingToTravel} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" required>
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
              <input type="radio" name="hasFormFAssessmentExperience" value="true" checked={form.hasFormFAssessmentExperience === true} onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: true }))} required className="accent-green-600" />
              Yes
            </label>
            <label className="inline-flex items-center ml-6 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
              <input type="radio" name="hasFormFAssessmentExperience" value="false" checked={form.hasFormFAssessmentExperience === false} onChange={() => setForm(f => ({ ...f, hasFormFAssessmentExperience: false, formFAssessmentExperienceYears: '' }))} required className="accent-green-600" />
              No
      </label>
          </div>
          {form.hasFormFAssessmentExperience === true && (
            <div className="mb-2">
              <label className="block mb-1">If yes, how many years of experience? <span className="text-red-600 font-bold">*</span></label>
              <select name="formFAssessmentExperienceYears" value={form.formFAssessmentExperienceYears} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" required>
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
                  <input type="checkbox" checked={form.otherSocialWorkAssessmentExperience.includes(opt)} onChange={() => handleArrayCheckboxChange('otherSocialWorkAssessmentExperience', opt)} className="accent-green-600" />
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
            <span className="block mb-2 font-bold text-base mt-4">What do you want to be considered for?</span>
            <div className="flex flex-col gap-1">
              {considerationOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 font-normal hover:bg-green-50 rounded px-2 py-1 cursor-pointer transition">
                  <input type="checkbox" checked={form.considerationFor.includes(opt)} onChange={() => handleArrayCheckboxChange('considerationFor', opt)} className="accent-green-600" />
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
                <span className="mr-2">📎</span>
                {form.cvFile ? 'Change file' : 'Choose file'}
                <input type="file" name="cvFile" accept=".pdf,.doc,.docx" onChange={handleChange} className="hidden accent-green-600" />
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
                <input type="radio" name="paymentPreferences" value={opt} checked={form.paymentPreferences === opt} onChange={handleChange} className="accent-green-600" />
                {opt}
      </label>
            ))}
          </div>
          {form.paymentPreferences === 'Other:' && (
            <input name="paymentOther" placeholder="Other payment preference" value={form.paymentOther} onChange={handleChange} className="w-full px-4 py-2 border rounded mb-2" />
          )}
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#2EAB2C] to-green-600 text-white py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 font-extrabold text-lg tracking-wide transition-all duration-200" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
    </form>
    </div>
  );
};

export default FreelancerPublicForm;