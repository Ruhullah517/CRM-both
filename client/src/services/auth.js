import axios from 'axios';

const API_URL = 'https://backendcrm.blackfostercarersalliance.co.uk/api/users';

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  login,
  logout,
};

export default authService;

export const requestPasswordReset = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, password });
  return response.data;
};
