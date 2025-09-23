import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-backend-0v14.onrender.com/api',
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

// Handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored user data and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
