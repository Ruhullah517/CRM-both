import api from './api';

async function download(path, filename) {
  const res = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const exportContacts = () => download('/exports/contacts', 'contacts.csv');
export const exportEnquiries = () => download('/exports/enquiries', 'enquiries.csv');
export const exportTrainingEvents = () => download('/exports/training-events', 'training-events.csv');
export const exportTrainingBookings = (eventId) => {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
  return download(`/exports/training-bookings${query}`, 'training-bookings.csv');
};
export const exportPaymentHistory = () => download('/exports/payment-history', 'payment-history.csv');


