import axios from 'axios';

const API_URL = 'http://localhost:3001/api/assessments';

export const getAssessmentByEnquiryId = async (enquiryId) => {
  const response = await axios.get(`${API_URL}/${enquiryId}`);
  return response.data;
};

export const createAssessment = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
}; 