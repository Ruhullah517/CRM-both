import api from './api';

export async function getContacts() {
  const res = await api.get('/contacts');
  return res.data;
}

export async function getContact(id) {
  const res = await api.get(`/contacts/${id}`);
  return res.data;
}

export async function createContact(contact) {
  const res = await api.post('/contacts', contact);
  return res.data;
}

export async function updateContact(id, contact) {
  const res = await api.put(`/contacts/${id}`, contact);
  return res.data;
}

export async function deleteContact(id) {
  const res = await api.delete(`/contacts/${id}`);
  return res.data;
} 