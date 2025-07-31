import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const FreelancerPublicForm = () => {
  const [formData, setFormData] = useState({});
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    const res = await fetch('/api/freelancers/public', {
      method: 'POST',
      body: data,
    });

    const result = await res.json();
    if (res.ok) {
      alert('Freelancer submitted successfully!');
    } else {
      alert(result.message || 'Submission failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Personal Information</h2>
      <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
      <input name="homeAddress" placeholder="Home Address" onChange={handleChange} />
      <input name="email" type="email" placeholder="Email Address" onChange={handleChange} />
      <input name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} />
      <label>
        Are you on WhatsApp?
        <input type="checkbox" name="isOnWhatsApp" onChange={handleChange} />
      </label>

      <h2 className="text-xl font-bold">Professional Information</h2>
      <label>Social Work England Registered?
        <select name="hasSocialWorkEnglandRegistration" onChange={handleChange}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <input name="socialWorkEnglandRegistrationNumber" placeholder="Registration Number" onChange={handleChange} />

      <label>Do you have a DBS Check?
        <select name="hasDBSCheck" onChange={handleChange}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <label>Are you on the update system?
        <select name="isOnUpdateSystem" onChange={handleChange}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <input type="file" name="dbsCertificate" onChange={handleChange} />

      <h2 className="text-xl font-bold">Location & Availability</h2>
      <input name="currentLocation" placeholder="Current Location (City & County)" onChange={handleChange} />
      <select name="geographicalLocation" onChange={handleChange}>
        <option value="">Select Region</option>
        <option>North East</option>
        <option>North West</option>
        <option>East Midlands</option>
        <option>West Midlands</option>
        <option>South East</option>
        <option>South West</option>
        <option>London</option>
        <option>Other</option>
        <option>Wales</option>
        <option>Scotland</option>
      </select>
      <select name="role" onChange={handleChange}>
        <option value="">Select Role</option>
        <option>Foster Carer</option>
        <option>Kinship Carer</option>
        <option>SGO</option>
        <option>Interested in Fostering</option>
        <option>Social Worker</option>
        <option>Other</option>
      </select>
      <input name="milesWillingToTravel" placeholder="Miles Willing to Travel for Training" onChange={handleChange} />

      <h2 className="text-xl font-bold">Work Experience & Skills</h2>
      <label>Form F Assessment Experience?
        <select name="hasFormFAssessmentExperience" onChange={handleChange}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <input name="formFAssessmentExperienceYears" placeholder="Years of Form F Experience" onChange={handleChange} />
      <label>Other Social Work Assessment Experience</label>
      <select name="otherSocialWorkAssessmentExperience" multiple onChange={handleChange}>
        <option>Fostering Panel Work</option>
        <option>Adoption Assessments</option>
        <option>Kinship Care Assessments</option>
        <option>SGO Assessments</option>
        <option>Court Report Writing</option>
        <option>Child Protection & Safeguarding</option>
        <option>Standard of Care investigation</option>
      </select>

      <h2 className="text-xl font-bold">Consideration for Work & Training</h2>
      <label>Consider me for:</label>
      <select name="considerationFor" multiple onChange={handleChange}>
        <option>Form F Assessments</option>
        <option>Other Social Work Assessments</option>
        <option>Delivery Training</option>
        <option>Initial Home Visit</option>
      </select>

      <h2 className="text-xl font-bold">Additional Information</h2>
      <textarea name="qualificationsAndTraining" placeholder="Relevant Qualifications & Training" onChange={handleChange} />
      <textarea name="additionalInfo" placeholder="Other Information" onChange={handleChange} />
      <textarea name="professionalReferences" placeholder="Professional References" onChange={handleChange} />
      <input type="file" name="cv" onChange={handleChange} />

      <h2 className="text-xl font-bold">Payment & Tax Information</h2>
      <select name="paymentPreferences" multiple onChange={handleChange}>
        <option>Through an umbrella company - we can refer</option>
        <option>Self-employed (invoice directly)</option>
        <option>Limited company (invoice through my company)</option>
        <option>Other</option>
      </select>
      <input name="paymentOther" placeholder="Other Payment Info" onChange={handleChange} />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
};

export default FreelancerPublicForm;