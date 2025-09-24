import api from './api';

export const getAssessmentByEnquiryId = async (enquiryId) => {
  const response = await api.get(`/assessments/${enquiryId}`);
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await api.post('/assessments', data);
  return response.data;
};

export const uploadAssessmentAttachment = async (file) => {
  const formData = new FormData();
  formData.append('attachment', file);
  
  const response = await api.post('/assessments/upload-attachment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}; 