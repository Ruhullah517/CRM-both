import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://crm-backend-0v14.onrender.com/api';

const getAuthToken = () => localStorage.getItem('token');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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


