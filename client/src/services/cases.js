import api from './api';

export async function getCases() {
  const res = await api.get('/cases');
  return res.data;
}

export async function getCase(id) {
  const res = await api.get(`/cases/${id}`);
  return res.data;
}

export async function createCase(caseData) {
  const res = await api.post('/cases', caseData);
  return res.data;
}

export async function updateCase(id, caseData) {
  const res = await api.put(`/cases/${id}`, caseData);
  return res.data;
}

export async function deleteCase(id) {
  const res = await api.delete(`/cases/${id}`);
  return res.data;
}

export async function uploadCaseFile(file) {
  const formData = new FormData();
  formData.append('applicationForm', file);
  const res = await api.post('/cases/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
} 