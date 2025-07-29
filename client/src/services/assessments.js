import axios from 'axios';

const API_URL = 'https://crm-backend-0v14.onrender.com/api/assessments';

export const getAssessmentByEnquiryId = async (enquiryId) => {
  const response = await axios.get(`${API_URL}/${enquiryId}`);
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
}; 