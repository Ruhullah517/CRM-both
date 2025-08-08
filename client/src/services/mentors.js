import api from './api';

export async function getMentors() {
  const res = await api.get('/mentors');
  return res.data;
}

export async function getMentor(id) {
  const res = await api.get(`/mentors/${id}`);
  return res.data;
}

export async function createMentor(mentor) {
  const res = await api.post('/mentors', mentor);
  return res.data;
}

export async function updateMentor(id, mentor) {
  const res = await api.put(`/mentors/${id}`, mentor);
  return res.data;
}

export async function deleteMentor(id) {
  const res = await api.delete(`/mentors/${id}`);
  return res.data;
}

export async function assignMenteesToMentor(mentorId, menteeIds, mentorName) {
  const res = await api.put(`/mentors/${mentorId}/assign-mentees`, { mentees: menteeIds, mentorName });
  return res.data;
} 