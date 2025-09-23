import api from './api';

export async function listInvoices() {
  const res = await api.get('/invoices');
  return res.data;
}

export async function getInvoiceById(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(invoiceData) {
  const res = await api.post('/invoices', invoiceData);
  return res.data;
}

export async function updateInvoice(id, invoiceData) {
  const res = await api.put(`/invoices/${id}`, invoiceData);
  return res.data;
}

export async function deleteInvoice(id) {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
}

export async function getInvoiceStats(params = {}) {
  const res = await api.get('/invoices/stats', { params });
  return res.data;
}

export async function getOverdueInvoices() {
  const res = await api.get('/invoices/overdue');
  return res.data;
}

export async function markInvoicePaid(id, paymentMethod) {
  const res = await api.put(`/invoices/${id}/mark-paid`, { paymentMethod });
  return res.data;
}

export async function sendInvoice(id) {
  const res = await api.put(`/invoices/${id}/send`);
  return res.data;
}

export async function generateInvoicePDF(id) {
  const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  return res.data;
}

export async function createInvoiceFromCase(caseId, invoiceData) {
  const res = await api.post(`/invoices/case/${caseId}`, invoiceData);
  return res.data;
}

export async function createInvoiceFromTrainingBooking(bookingId, invoiceData) {
  const res = await api.post(`/invoices/training-booking/${bookingId}`, invoiceData);
  return res.data;
}

export async function autoCreateInvoicesForPaidTraining(trainingEventId) {
  const res = await api.post(`/invoices/training-event/${trainingEventId}/auto-create`);
  return res.data;
}
