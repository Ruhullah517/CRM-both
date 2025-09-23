import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://crm-backend-0v14.onrender.com/api';

const getAuthToken = () => localStorage.getItem('token');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCasesStatus = (params = {}) => api.get('/reports/cases-status', { params }).then(r => r.data);
export const getCaseTypeDistribution = () => api.get('/reports/case-type-distribution').then(r => r.data);
export const getCaseloadByWorker = () => api.get('/reports/caseload-by-worker').then(r => r.data);
export const getTimeToResolution = (params = {}) => api.get('/reports/time-to-resolution', { params }).then(r => r.data);
export const getDemographics = () => api.get('/reports/demographics').then(r => r.data);
export const getTimeLogged = () => api.get('/reports/time-logged').then(r => r.data);
export const getInvoiceableHours = (params = {}) => api.get('/reports/invoiceable-hours', { params }).then(r => r.data);


