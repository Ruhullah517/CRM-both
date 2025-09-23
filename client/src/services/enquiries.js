import api from './api';

export const getEnquiries = async () => {
  const response = await api.get('/enquiries');
  return response.data;
};

export const getEnquiryById = async (id) => {
  const response = await api.get(`/enquiries/${id}`);
  return response.data;
};

export const approveEnquiry = async (id) => {
  const response = await api.post(`/enquiries/${id}/approve`);
  return response.data;
};

export const rejectEnquiry = async (id, reason) => {
  const response = await api.post(`/enquiries/${id}/reject`, { reason });
  return response.data;
};

export const assignEnquiry = async (id, staffId) => {
  const response = await api.post(`/enquiries/${id}/assign`, { staffId });
  return response.data;
};

export const updateEnquiry = async (id, data) => {
  const response = await api.put(`/enquiries/${id}`, data);
  return response.data;
};

export const createEnquiry = async (data) => {
  const response = await api.post('/enquiries', data);
  return response.data;
};

export async function deleteEnquiry(id) {
  const res = await api.delete(`/enquiries/${id}`);
  return res.data;
}