import api from './api';

export async function listReminders(params = {}) {
  const res = await api.get('/reminders', { params });
  return res.data;
}

export async function createReminder(payload) {
  const res = await api.post('/reminders', payload);
  return res.data;
}

export async function completeReminder(id) {
  const res = await api.put(`/reminders/${id}/complete`);
  return res.data;
}


