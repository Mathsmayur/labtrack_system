import api from './api';

export const login = async (username, password, department) => {
  const response = await api.post('/auth/login', {
    username,
    password,
    department,
  });
  return response.data;
};

export const register = async (username, password, name, role, department) => {
  const response = await api.post('/auth/register', {
    username,
    password,
    name,
    role,
    department,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
