import api from './api';

export async function getGeneratedContracts() {
  const res = await api.get('/contracts');
  return res.data;
}

export async function getGeneratedContract(id) {
  const res = await api.get(`/contracts/${id}`);
  return res.data;
}

export async function generateContract(data) {
  const res = await api.post('/contracts/generate', data);
  return res.data;
}

export async function downloadContract(id) {
  // Returns the download URL for the contract PDF
  return `${api.defaults.baseURL.replace(/\/api$/, '')}/contracts/${id}/download`;
} 

export async function deleteContract(contractId) {
  const res = await api.delete(`/contracts/${contractId}`);
  return res.data;
}