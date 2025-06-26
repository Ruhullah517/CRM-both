import api from './api';

export async function getContracts() {
  const res = await api.get('/contracts');
  return res.data;
}

export async function getContract(id) {
  const res = await api.get(`/contracts/${id}`);
  return res.data;
}

export async function createContract(contract) {
  const res = await api.post('/contracts', contract);
  return res.data;
}

export async function updateContract(id, contract) {
  const res = await api.put(`/contracts/${id}`, contract);
  return res.data;
}

export async function deleteContract(id) {
  const res = await api.delete(`/contracts/${id}`);
  return res.data;
} 