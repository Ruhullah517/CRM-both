import api from './api';

import { SERVER_BASE_URL } from '../config/api';

const API_URL = `${SERVER_BASE_URL}/api/gdpr`;

// Consent management
export const getContactConsent = async (contactId) => {
  const response = await api.get(`${API_URL}/consent/${contactId}`);
  return response.data;
};

export const recordConsent = async (consentData) => {
  const response = await api.post(`${API_URL}/consent`, consentData);
  return response.data;
};

// Data retention policies
export const getDataRetentionPolicies = async () => {
  const response = await api.get(`${API_URL}/retention-policies`);
  return response.data;
};

export const setDataRetentionPolicy = async (policyData) => {
  const response = await api.post(`${API_URL}/retention-policies`, policyData);
  return response.data;
};

// Audit logs
export const getAuditLogs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  const response = await api.get(`${API_URL}/audit-logs?${queryParams}`);
  return response.data;
};

// Data export and anonymization
export const exportUserData = async (contactId) => {
  const response = await api.get(`${API_URL}/export/${contactId}`);
  return response.data;
};

export const anonymizeUserData = async (contactId, reason) => {
  const response = await api.post(`${API_URL}/anonymize/${contactId}`, { reason });
  return response.data;
};

// Compliance reporting
export const getComplianceReport = async () => {
  const response = await api.get(`${API_URL}/compliance-report`);
  return response.data;
};

export const processDataRetention = async () => {
  const response = await api.post(`${API_URL}/process-retention`);
  return response.data;
};
