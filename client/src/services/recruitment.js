import api from './api';

export async function createInitialAssessment(payload) {
  const res = await api.post('/recruitment/initial-assessments', payload);
  return res.data;
}

export async function createFullAssessment(payload) {
  const res = await api.post('/recruitment/full-assessments', payload);
  return res.data;
}

export async function allocateMentoring(payload) {
  const res = await api.post('/recruitment/mentoring', payload);
  return res.data;
}

export async function addMentoringSession(mentoringId, session) {
  const res = await api.post(`/recruitment/mentoring/${mentoringId}/sessions`, session);
  return res.data;
}

export async function addCaseNote(payload) {
  const res = await api.post('/recruitment/case-notes', payload);
  return res.data;
}


