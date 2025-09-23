import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://crm-backend-0v14.onrender.com/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Send bulk email
export const sendBulkEmail = async (templateId, recipients, subjectOverride = null, bodyOverride = null) => {
  try {
    const response = await api.post('/emails/bulk', {
      templateId,
      recipients,
      subjectOverride,
      bodyOverride
    });
    return response.data;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
};

// Send individual email
export const sendIndividualEmail = async (templateId, recipient, subjectOverride = null, bodyOverride = null, data = {}) => {
  try {
    const response = await api.post('/emails/individual', {
      templateId,
      recipient,
      subjectOverride,
      bodyOverride,
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error sending individual email:', error);
    throw error;
  }
};

// Send email to contacts by tags
export const sendEmailToContactsByTags = async (templateId, tags, subjectOverride = null, bodyOverride = null, data = {}) => {
  try {
    const response = await api.post('/emails/contacts-by-tags', {
      templateId,
      tags,
      subjectOverride,
      bodyOverride,
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email to contacts by tags:', error);
    throw error;
  }
};

// Get email history
export const getEmailHistory = async (page = 1, limit = 50, status = null, templateId = null) => {
  try {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (templateId) params.append('templateId', templateId);
    
    const response = await api.get(`/emails/history?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching email history:', error);
    throw error;
  }
};

// Get email statistics
export const getEmailStats = async (startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/emails/stats?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    throw error;
  }
};

// Preview email
export const previewEmail = async (templateId, data = {}) => {
  try {
    const response = await api.post('/emails/preview', {
      templateId,
      data
    });
    return response.data;
  } catch (error) {
    console.error('Error previewing email:', error);
    throw error;
  }
};
