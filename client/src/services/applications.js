import axios from 'axios';
import api from './api';

import { SERVER_BASE_URL } from '../config/api';

const API_URL = `${SERVER_BASE_URL}/api/applications`;

export const getApplicationByEnquiryId = async (enquiryId) => {
  try {
    const response = await api.get(`/applications/${enquiryId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // No application found
    }
    throw error;
  }
};

export const uploadApplication = async (formData) => {
  const response = await api.post('/applications/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export async function getFormFSessions(enquiryId) {
  const res = await api.get(`/formf-sessions/${enquiryId}`);
  return res.data;
}

export async function saveFormFSessions(enquiryId, sessions) {
  const res = await api.post(`/formf-sessions/${enquiryId}`, { sessions });
  return res.data;
}

// User management endpoints
export async function updateUser(id, user) {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
} 