import api from './api';

export const getFreelancers = async () => {
  const response = await api.get('/freelancers');
  return response.data;
};

// Alias for getAllFreelancers
export const getAllFreelancers = getFreelancers;

export const getFreelancerById = async (id) => {
  const response = await api.get(`/freelancers/${id}`);
  return response.data;
};

export const getFreelancerByEmail = async (email) => {
  const response = await api.get(`/freelancers/email/${email}`);
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

export const updateMyAvailability = async (availabilityData) => {
  const response = await api.put('/freelancers/my-availability', availabilityData);
  return response.data;
};

export const addComplianceDocument = async (id, documentData) => {
  const formData = new FormData();
  formData.append('name', documentData.name);
  formData.append('type', documentData.type);
  formData.append('expiryDate', documentData.expiryDate);
  if (documentData.file) {
    formData.append('complianceFile', documentData.file);
  }

  const response = await api.post(`/freelancers/${id}/compliance-documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteComplianceDocument = async (id, documentIndex) => {
  const response = await api.delete(`/freelancers/${id}/compliance-documents/${documentIndex}`);
  return response.data;
};

export const addWorkHistory = async (id, workHistoryData) => {
  const response = await api.post(`/freelancers/${id}/work-history`, workHistoryData);
  return response.data;
};

export const updateWorkHistory = async (id, workIndex, workHistoryData) => {
  const response = await api.put(`/freelancers/${id}/work-history/${workIndex}`, workHistoryData);
  return response.data;
};

export const deleteWorkHistory = async (id, workIndex) => {
  const response = await api.delete(`/freelancers/${id}/work-history/${workIndex}`);
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

export const updateFreelancerStatus = async (id, status) => {
  const response = await api.put(`/recruitment/freelancer-applications/${id}/status`, { status });
  return response.data;
};

export const createUserAccountForFreelancer = async (id) => {
  const response = await api.post(`/freelancers/${id}/create-user-account`);
  return response.data;
};

export const checkUserAccountExists = async (email) => {
  try {
    const response = await api.get(`/users?email=${email}`);
    return response.data && response.data.length > 0;
  } catch (error) {
    return false;
  }
};