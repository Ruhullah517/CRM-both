import api from './api';

export async function getUsers() {
  const res = await api.get('/users');
  return res.data;
}

export async function createUser(user) {
  const res = await api.post('/users', user);
  return res.data;
}

export async function updateUser(id, user) {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function loginUser(credentials) {
  const res = await api.post('/users/login', credentials);
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
} 