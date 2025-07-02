import api from './api';

export async function getContractTemplates() {
  const res = await api.get('/contract-templates');
  return res.data;
}

export async function getContractTemplate(id) {
  const res = await api.get(`/contract-templates/${id}`);
  return res.data;
}

export async function createContractTemplate(template) {
  const res = await api.post('/contract-templates', template);
  return res.data;
}

export async function updateContractTemplate(id, template) {
  const res = await api.put(`/contract-templates/${id}`, template);
  return res.data;
}

export async function deleteContractTemplate(id) {
  const res = await api.delete(`/contract-templates/${id}`);
  return res.data;
} 