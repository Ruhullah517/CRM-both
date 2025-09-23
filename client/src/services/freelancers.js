import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://crm-backend-0v14.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const getFormDataHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const getFreelancers = async () => {
  const response = await axios.get(`${API_BASE_URL}/freelancers`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getFreelancerById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/freelancers/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const createFreelancer = async (freelancerData) => {
  const formData = new FormData();
  
  // Add all form fields
  Object.keys(freelancerData).forEach(key => {
    if (key === 'dbsCertificateFile' || key === 'cvFile') {
      if (freelancerData[key]) {
        formData.append(key, freelancerData[key]);
      }
    } else if (Array.isArray(freelancerData[key])) {
      formData.append(key, JSON.stringify(freelancerData[key]));
    } else {
      formData.append(key, freelancerData[key] || '');
    }
  });

  const response = await axios.post(`${API_BASE_URL}/freelancers`, formData, {
    headers: getFormDataHeaders()
  });
  return response.data;
};

export const updateFreelancer = async (id, freelancerData) => {
  const formData = new FormData();
  
  // Add all form fields
  Object.keys(freelancerData).forEach(key => {
    if (key === 'dbsCertificateFile' || key === 'cvFile') {
      if (freelancerData[key]) {
        formData.append(key, freelancerData[key]);
      }
    } else if (Array.isArray(freelancerData[key])) {
      formData.append(key, JSON.stringify(freelancerData[key]));
    } else {
      formData.append(key, freelancerData[key] || '');
    }
  });

  const response = await axios.put(`${API_BASE_URL}/freelancers/${id}`, formData, {
    headers: getFormDataHeaders()
  });
  return response.data;
};

export const deleteFreelancer = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/freelancers/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// HR Module functions
export const updateFreelancerAvailability = async (id, availability, availabilityNotes) => {
  const response = await axios.put(`${API_BASE_URL}/freelancers/${id}/availability`, {
    availability,
    availabilityNotes
  }, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const addComplianceDocument = async (id, documentData) => {
  const formData = new FormData();
  
  Object.keys(documentData).forEach(key => {
    if (key === 'complianceFile') {
      if (documentData[key]) {
        formData.append(key, documentData[key]);
      }
    } else {
      formData.append(key, documentData[key] || '');
    }
  });

  const response = await axios.post(`${API_BASE_URL}/freelancers/${id}/compliance-documents`, formData, {
    headers: getFormDataHeaders()
  });
  return response.data;
};

export const addWorkHistory = async (id, workData) => {
  const response = await axios.post(`${API_BASE_URL}/freelancers/${id}/work-history`, workData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const getExpiringCompliance = async (days = 30) => {
  const response = await axios.get(`${API_BASE_URL}/freelancers/expiring-compliance?days=${days}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const updateContractRenewal = async (id, contractData) => {
  const response = await axios.put(`${API_BASE_URL}/freelancers/${id}/contract-renewal`, contractData, {
    headers: getAuthHeaders()
  });
  return response.data;
};