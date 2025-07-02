import api from './api';

export async function getEmailTemplates() {
  const res = await api.get('/email-templates');
  return res.data;
}

export async function getEmailTemplate(id) {
  const res = await api.get(`/email-templates/${id}`);
  return res.data;
}

export async function createEmailTemplate(template) {
  const res = await api.post('/email-templates', template);
  return res.data;
}

export async function updateEmailTemplate(id, template) {
  const res = await api.put(`/email-templates/${id}`, template);
  return res.data;
}

export async function deleteEmailTemplate(id) {
  const res = await api.delete(`/email-templates/${id}`);
  return res.data;
} 