import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backendcrm.blackfostercarersalliance.co.uk/api',
  withCredentials: false,
});

// Attach JWT token to every request if present
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    // Prefer token from user object if present
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.token) token = parsed.token;
      } catch { }
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
