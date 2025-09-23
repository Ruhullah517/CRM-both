import api from './api';

export const getAllContacts = async () => {
  const response = await api.get('/contacts');
  return response.data;
};

export const getContactById = async (id) => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

export const createContact = async (contactData) => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

export const updateContact = async (id, contactData) => {
  const response = await api.put(`/contacts/${id}`, contactData);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

export const getContactsByTags = async (tags) => {
  const response = await api.get(`/contacts/tags?tags=${tags.join(',')}`);
  return response.data;
};

export const getContactsByType = async (type) => {
  const response = await api.get(`/contacts/type/${type}`);
  return response.data;
};

export const getContactsNeedingFollowUp = async () => {
  const response = await api.get('/contacts/follow-up');
  return response.data;
};

export const addCommunicationHistory = async (id, communicationData) => {
  const response = await api.post(`/contacts/${id}/communication`, communicationData);
  return response.data;
};

export const updateLeadScore = async (id, score) => {
  const response = await api.put(`/contacts/${id}/lead-score`, { score });
  return response.data;
};

export const getContactStats = async () => {
  const response = await api.get('/contacts/stats');
  return response.data;
};

export const bulkUpdateContacts = async (contactIds, updateData) => {
  const response = await api.put('/contacts/bulk-update', {
    contactIds,
    updateData
  });
  return response.data;
};