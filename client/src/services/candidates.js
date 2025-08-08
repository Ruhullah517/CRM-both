import api from './api';

export async function getCandidates() {
  const res = await api.get('/candidates');
  return res.data;
}

export async function getCandidate(id) {
  const res = await api.get(`/candidates/${id}`);
  return res.data;
}

export async function createCandidate(candidate) {
  const res = await api.post('/candidates', candidate);
  return res.data;
}

export async function updateCandidate(id, candidate) {
  const res = await api.put(`/candidates/${id}`, candidate);
  return res.data;
}

export async function deleteCandidate(id) {
  const res = await api.delete(`/candidates/${id}`);
  return res.data;
}

export async function assignMentorToCandidate(candidateId, mentorName) {
  const res = await api.put(`/candidates/${candidateId}/assign-mentor`, { mentor: mentorName });
  return res.data;
}
