import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-backend-0v14.onrender.com/api',
  withCredentials: false,
});

export default api;
