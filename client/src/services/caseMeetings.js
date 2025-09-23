import api from './api';

export async function listCaseMeetings(caseId) {
  const res = await api.get(`/cases/${caseId}/meetings`);
  return res.data;
}

export async function createCaseMeeting(caseId, payload) {
  const res = await api.post(`/cases/${caseId}/meetings`, payload);
  return res.data;
}

export async function uploadCaseMeetingFile(caseId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/cases/${caseId}/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}


