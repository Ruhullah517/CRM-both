import axios from 'axios';

const API_URL = 'https://crm-backend-0v14.onrender.com/api/assessments';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAssessmentByEnquiryId = async (enquiryId) => {
  const response = await axios.get(`${API_URL}/${enquiryId}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await axios.post(API_URL, data, {
    headers: getAuthHeaders()
  });
  return response.data;
}; 