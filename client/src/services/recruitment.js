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

export async function updateEnquiryStage(enquiryId, stage) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/stage`, { stage });
  return res.data;
}

export async function addStageEntry(enquiryId, entry) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/stage-entry`, entry);
  return res.data;
}

export async function uploadStageEntryFile(enquiryId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/stage-entry/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getStageEntries(enquiryId) {
  const res = await api.get(`/recruitment/enquiries/${enquiryId}/stage-entries`);
  return res.data;
}

// Assign mentor/assessor
export async function assignMentorAssessor(enquiryId, payload) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/assign`, payload);
  return res.data;
}

// Update enquiry lifecycle status
export async function updateEnquiryStatus(enquiryId, payload) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/status`, payload);
  return res.data;
}

// Set stage deadline
export async function setStageDeadline(enquiryId, payload) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/stage-deadline`, payload);
  return res.data;
}

// Complete stage deadline
export async function completeStageDeadline(enquiryId, stage) {
  const res = await api.post(`/recruitment/enquiries/${enquiryId}/stage-deadline/complete`, { stage });
  return res.data;
}



