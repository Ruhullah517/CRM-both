import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PublicFreelancerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      dateOfBirth: '',
      nationalInsurance: ''
    },
    professionalInfo: {
      roleType: '',
      qualifications: '',
      experience: '',
      specializations: '',
      currentRole: '',
      yearsExperience: '',
      hourlyRate: '',
      dailyRate: ''
    },
    availability: {
      preferredHours: '',
      availableDays: [],
      location: '',
      travelWillingness: '',
      noticePeriod: ''
    },
    documents: {
      cv: null,
      qualifications: null,
      dbs: null,
      references: null,
      insurance: null
    },
    additionalInfo: {
      motivation: '',
      additionalSkills: '',
      emergencyContact: '',
      emergencyPhone: '',
      bankDetails: {
        accountName: '',
        accountNumber: '',
        sortCode: ''
      }
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (section, field, value) => {
    if (section === 'additionalInfo' && field === 'bankDetails') {
      setFormData(prev => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          bankDetails: {
            ...prev.additionalInfo.bankDetails,
            ...value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: prev.availability[field].includes(value)
          ? prev.availability[field].filter(day => day !== value)
          : [...prev.availability[field], value]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([section, data]) => {
        if (section === 'documents') {
          Object.entries(data).forEach(([key, file]) => {
            if (file) {
              formDataToSend.append(`documents.${key}`, file);
            }
          });
        } else if (section === 'additionalInfo' && data.bankDetails) {
          Object.entries(data).forEach(([key, value]) => {
            if (key === 'bankDetails') {
              Object.entries(value).forEach(([bankKey, bankValue]) => {
                formDataToSend.append(`${section}.${key}.${bankKey}`, bankValue);
              });
            } else if (Array.isArray(value)) {
              formDataToSend.append(`${section}.${key}`, JSON.stringify(value));
            } else {
              formDataToSend.append(`${section}.${key}`, value);
            }
          });
        } else {
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              formDataToSend.append(`${section}.${key}`, JSON.stringify(value));
            } else {
              formDataToSend.append(`${section}.${key}`, value);
            }
          });
        }
      });

      formDataToSend.append('type', 'freelancer');
      formDataToSend.append('submittedAt', new Date().toISOString());

      const response = await fetch('https://crm-backend-0v14.onrender.com/api/recruitment/freelancer-application', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Application Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your interest in becoming a freelancer with Black Foster Carers Alliance. 
            We will review your application and contact you within 5-7 business days.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Application Form</h1>
          <p className="mt-2 text-lg text-gray-600">
            Join Black Foster Carers Alliance as a Freelancer
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Email: <span className="text-green-600 font-semibold">Enquiries@blackfostercarersalliance.co.uk</span></p>
            <p>Phone: <span className="text-green-600 font-semibold">0800 001 6230</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.personalInfo.address}
                  onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postcode *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.postcode}
                  onChange={(e) => handleInputChange('personalInfo', 'postcode', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">National Insurance Number *</label>
                <input
                  type="text"
                  required
                  value={formData.personalInfo.nationalInsurance}
                  onChange={(e) => handleInputChange('personalInfo', 'nationalInsurance', e.target.value)}
                  placeholder="AB123456C"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2" />
              Professional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Type *</label>
                <select
                  required
                  value={formData.professionalInfo.roleType}
                  onChange={(e) => handleInputChange('professionalInfo', 'roleType', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select role type</option>
                  <option value="assessor">Assessor</option>
                  <option value="trainer">Trainer</option>
                  <option value="mentor">Mentor</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualifications *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.professionalInfo.qualifications}
                  onChange={(e) => handleInputChange('professionalInfo', 'qualifications', e.target.value)}
                  placeholder="List your relevant qualifications, certifications, and training"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Relevant Experience *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.professionalInfo.experience}
                  onChange={(e) => handleInputChange('professionalInfo', 'experience', e.target.value)}
                  placeholder="Describe your experience in social work, fostering, or related fields"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specializations</label>
                  <input
                    type="text"
                    value={formData.professionalInfo.specializations}
                    onChange={(e) => handleInputChange('professionalInfo', 'specializations', e.target.value)}
                    placeholder="e.g., Child Psychology, Family Therapy, etc."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years of Experience *</label>
                  <select
                    required
                    value={formData.professionalInfo.yearsExperience}
                    onChange={(e) => handleInputChange('professionalInfo', 'yearsExperience', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select years</option>
                    <option value="0-1">0-1 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hourly Rate (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.50"
                    value={formData.professionalInfo.hourlyRate}
                    onChange={(e) => handleInputChange('professionalInfo', 'hourlyRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Rate (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={formData.professionalInfo.dailyRate}
                    onChange={(e) => handleInputChange('professionalInfo', 'dailyRate', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Availability
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Hours per Week *</label>
                <select
                  required
                  value={formData.availability.preferredHours}
                  onChange={(e) => handleInputChange('availability', 'preferredHours', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select hours</option>
                  <option value="1-5">1-5 hours</option>
                  <option value="6-10">6-10 hours</option>
                  <option value="11-20">11-20 hours</option>
                  <option value="20+">20+ hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Days *</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availability.availableDays.includes(day)}
                        onChange={(e) => handleCheckboxChange('availableDays', day)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Willing to Travel *</label>
                  <select
                    required
                    value={formData.availability.travelWillingness}
                    onChange={(e) => handleInputChange('availability', 'travelWillingness', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select option</option>
                    <option value="local">Local only (within 10 miles)</option>
                    <option value="regional">Regional (within 50 miles)</option>
                    <option value="national">National (anywhere in UK)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notice Period *</label>
                  <select
                    required
                    value={formData.availability.noticePeriod}
                    onChange={(e) => handleInputChange('availability', 'noticePeriod', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select notice period</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-week">1 week</option>
                    <option value="2-weeks">2 weeks</option>
                    <option value="1-month">1 month</option>
                    <option value="2-months">2+ months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Required Documents
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CV/Resume *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('cv', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Qualifications Certificates *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('qualifications', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DBS Certificate *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('dbs', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Professional Indemnity Insurance *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('insurance', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">References (2 required) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('references', e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name *</label>
                <input
                  type="text"
                  required
                  value={formData.additionalInfo.bankDetails.accountName}
                  onChange={(e) => handleInputChange('additionalInfo', 'bankDetails', { accountName: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input
                  type="text"
                  required
                  value={formData.additionalInfo.bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('additionalInfo', 'bankDetails', { accountNumber: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort Code *</label>
                <input
                  type="text"
                  required
                  value={formData.additionalInfo.bankDetails.sortCode}
                  onChange={(e) => handleInputChange('additionalInfo', 'bankDetails', { sortCode: e.target.value })}
                  placeholder="12-34-56"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Why do you want to work with us? *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.additionalInfo.motivation}
                  onChange={(e) => handleInputChange('additionalInfo', 'motivation', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Additional Skills or Experience</label>
                <textarea
                  rows={3}
                  value={formData.additionalInfo.additionalSkills}
                  onChange={(e) => handleInputChange('additionalInfo', 'additionalSkills', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.additionalInfo.emergencyContact}
                    onChange={(e) => handleInputChange('additionalInfo', 'emergencyContact', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.additionalInfo.emergencyPhone}
                    onChange={(e) => handleInputChange('additionalInfo', 'emergencyPhone', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PublicFreelancerForm;
