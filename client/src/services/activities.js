import api from './api';

export const getActivitiesByCase = async (caseId) => {
  const response = await api.get(`/cases/${caseId}/activities`);
  return response.data;
};

export const logActivity = async (caseId, activityData) => {
  const response = await api.post(`/cases/${caseId}/activities`, activityData);
  return response.data;
};
