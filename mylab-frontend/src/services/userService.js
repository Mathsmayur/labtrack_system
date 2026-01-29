import api from './api';

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getByUsername = async (username) => {
  const response = await api.get('/users/by-username', { params: { username } });
  return response.data;
};
