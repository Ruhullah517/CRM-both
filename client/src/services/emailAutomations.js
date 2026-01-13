import api from './api';

import { SERVER_BASE_URL } from '../config/api';

const API_URL = `${SERVER_BASE_URL}/api/email-automations`;

export const getAllAutomations = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getAutomationById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createAutomation = async (automationData) => {
  const response = await api.post(API_URL, automationData);
  return response.data;
};

export const updateAutomation = async (id, automationData) => {
  const response = await api.put(`${API_URL}/${id}`, automationData);
  return response.data;
};

export const deleteAutomation = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export const toggleAutomation = async (id) => {
  const response = await api.patch(`${API_URL}/${id}/toggle`);
  return response.data;
};

export const getAutomationLogs = async (automationId, page = 1, limit = 20, status = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (automationId) params.append('automationId', automationId);
  if (status) params.append('status', status);
  
  const response = await api.get(`${API_URL}/${automationId}/logs?${params}`);
  return response.data;
};

export const testAutomation = async (id, testEmail) => {
  const response = await api.post(`${API_URL}/${id}/test`, { testEmail });
  return response.data;
};
