import api from './api';

export const getLabs = async (department = null) => {
  const params = department ? { department } : {};
  const response = await api.get('/labs', { params });
  return response.data;
};

export const getLabById = async (id) => {
  const response = await api.get(`/labs/${id}`);
  return response.data;
};

export const createLab = async (labData) => {
  const response = await api.post('/labs', labData);
  return response.data;
};

export const updateLab = async (id, labData) => {
  const response = await api.put(`/labs/${id}`, labData);
  return response.data;
};

export const deleteLab = async (id) => {
  const response = await api.delete(`/labs/${id}`);
  return response.data;
};