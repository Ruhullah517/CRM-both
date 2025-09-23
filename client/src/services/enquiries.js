import axios from 'axios';

const API_URL = 'https://crm-backend-0v14.onrender.com/api/enquiries';

export const getEnquiries = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getEnquiryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const approveEnquiry = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/approve`);
  return response.data;
};

export const rejectEnquiry = async (id, reason) => {
  const response = await axios.post(`${API_URL}/${id}/reject`, { reason });
  return response.data;
};

export const assignEnquiry = async (id, staffId) => {
  const response = await axios.post(`${API_URL}/${id}/assign`, { staffId });
  return response.data;
}; 
export async function deleteEnquiry(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete enquiry');
  return res.json();
}