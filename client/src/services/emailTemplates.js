import api from './api';

export async function getEmailTemplates() {
  const res = await api.get('/email-templates');
  return res.data;
}

export async function getEmailTemplate(id) {
  const res = await api.get(`/email-templates/${id}`);
  return res.data;
}

export async function createEmailTemplate(templateData) {
  const res = await api.post('/email-templates', templateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function updateEmailTemplate(id, templateData) {
  const res = await api.put(`/email-templates/${id}`, templateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export async function deleteEmailTemplate(id) {
  const res = await api.delete(`/email-templates/${id}`);
  return res.data;
}

// Bulk email service
export async function sendBulkEmail({ templateId, recipients, subjectOverride, bodyOverride }) {
  const res = await api.post('/email-templates/bulk', {
    templateId,
    recipients,
    subjectOverride,
    bodyOverride,
  });
  return res.data;
} 