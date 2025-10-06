import api from './api';

export const getFreelancers = async () => {
  const response = await api.get('/freelancers');
  return response.data;
};

export const getFreelancerById = async (id) => {
  const response = await api.get(`/freelancers/${id}`);
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

  const response = await api.post('/freelancers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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

  const response = await api.put(`/freelancers/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteFreelancer = async (id) => {
  const response = await api.delete(`/freelancers/${id}`);
  return response.data;
};

// HR Module functions
export const updateFreelancerAvailability = async (id, availabilityData) => {
  const response = await api.put(`/freelancers/${id}/availability`, availabilityData);
  return response.data;
};

export const addComplianceDocument = async (id, documentData) => {
  const formData = new FormData();
  formData.append('name', documentData.name);
  formData.append('type', documentData.type);
  formData.append('expiryDate', documentData.expiryDate);
  if (documentData.file) {
    formData.append('file', documentData.file);
  }

  const response = await api.post(`/freelancers/${id}/compliance`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const addWorkHistory = async (id, workHistoryData) => {
  const response = await api.post(`/freelancers/${id}/work-history`, workHistoryData);
  return response.data;
};

export const getExpiringCompliance = async () => {
  const response = await api.get('/freelancers/compliance/expiring');
  return response.data;
};

export const updateContractRenewal = async (id, renewalData) => {
  const response = await api.put(`/freelancers/${id}/contract-renewal`, renewalData);
  return response.data;
};