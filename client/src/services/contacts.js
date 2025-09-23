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

// Get all contacts
export const getAllContacts = async () => {
  try {
    const response = await api.get('/contacts');
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Get contact by ID
export const getContactById = async (id) => {
  try {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

// Create contact
export const createContact = async (contactData) => {
  try {
    const response = await api.post('/contacts', contactData);
    return response.data;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

// Update contact
export const updateContact = async (id, contactData) => {
  try {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

// Delete contact
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Get contacts by tags
export const getContactsByTags = async (tags) => {
  try {
    const params = new URLSearchParams();
    if (Array.isArray(tags)) {
      tags.forEach(tag => params.append('tags', tag));
    } else {
      params.append('tags', tags);
    }
    
    const response = await api.get(`/contacts/by-tags?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts by tags:', error);
    throw error;
  }
};

// Get contacts by type
export const getContactsByType = async (contactType) => {
  try {
    const response = await api.get(`/contacts/by-type/${contactType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts by type:', error);
    throw error;
  }
};

// Get contacts needing follow-up
export const getContactsNeedingFollowUp = async (days = 7) => {
  try {
    const response = await api.get(`/contacts/follow-up-needed?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts needing follow-up:', error);
    throw error;
  }
};

// Add communication history
export const addCommunicationHistory = async (contactId, type, summary, engagement = {}) => {
  try {
    const response = await api.post(`/contacts/${contactId}/communication`, {
      type,
      summary,
      engagement
    });
    return response.data;
  } catch (error) {
    console.error('Error adding communication history:', error);
    throw error;
  }
};

// Update lead score
export const updateLeadScore = async (contactId, leadScore) => {
  try {
    const response = await api.put(`/contacts/${contactId}/lead-score`, {
      leadScore
    });
    return response.data;
  } catch (error) {
    console.error('Error updating lead score:', error);
    throw error;
  }
};

// Get contact statistics
export const getContactStats = async () => {
  try {
    const response = await api.get('/contacts/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    throw error;
  }
};

// Bulk update contacts
export const bulkUpdateContacts = async (contactIds, updateData) => {
  try {
    const response = await api.put('/contacts/bulk-update', {
      contactIds,
      updateData
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating contacts:', error);
    throw error;
  }
};