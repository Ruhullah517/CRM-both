import api from './api';

export async function getFreelancers() {
  const res = await api.get('/freelancers');
  return res.data;
}

export async function getFreelancer(id) {
  const res = await api.get(`/freelancers/${id}`);
  return res.data;
}

export async function createFreelancer(freelancer) {
  const res = await api.post('/freelancers', freelancer);
  return res.data;
}

export async function updateFreelancer(id, freelancer) {
  const res = await api.put(`/freelancers/${id}`, freelancer);
  return res.data;
}

export async function deleteFreelancer(id) {
  const res = await api.delete(`/freelancers/${id}`);
  return res.data;
} 