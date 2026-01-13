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

export async function getMentorActivities(mentorId) {
  const res = await api.get(`/mentors/${mentorId}/activities`);
  return res.data;
}

export async function logMentorActivity(mentorId, activityData) {
  const res = await api.post(`/mentors/${mentorId}/activities`, activityData);
  return res.data;
}

export async function getAssignmentDetail(mentorId, assignmentId) {
  const res = await api.get(`/mentors/${mentorId}/assignments/${assignmentId}`);
  return res.data;
}

export async function addAssignmentLog(mentorId, assignmentId, logData) {
  const res = await api.post(`/mentors/${mentorId}/assignments/${assignmentId}/logs`, logData);
  return res.data;
}

export async function getMentorAssignments(mentorId) {
  const res = await api.get(`/mentors/${mentorId}/assignments`);
  return res.data;
}

export async function completeAssignment(mentorId, assignmentId, completionNotes) {
  const res = await api.put(`/mentors/${mentorId}/assignments/${assignmentId}/complete`, { completionNotes });
  return res.data;
}

export async function assignMenteesToMentor(mentorId, menteeIds, mentorName) {
  const res = await api.put(`/mentors/${mentorId}/assign-mentees`, { mentees: menteeIds, mentorName });
  return res.data;
} 