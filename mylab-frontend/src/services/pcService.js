import api from './api';

export const getPCsByLab = async (labId, status = null) => {
  const params = status ? { status } : {};
  const response = await api.get(`/pcs/lab/${labId}`, { params });
  return response.data;
};

export const getPCById = async (id) => {
  const response = await api.get(`/pcs/${id}`);
  return response.data;
};

export const createPC = async (pcData) => {
  const response = await api.post('/pcs', pcData);
  return response.data;
};

export const updatePC = async (id, pcData) => {
  const response = await api.put(`/pcs/${id}`, pcData);
  return response.data;
};

export const deletePC = async (id) => {
  const response = await api.delete(`/pcs/${id}`);
  return response.data;
};

export const getUnassignedPCs = async () => {
  const response = await api.get('/pcs/unassigned');
  return response.data;
};

export const createBulkPCs = async (requestData) => {
  const response = await api.post('/pcs/bulk', requestData);
  return response.data;
};

export const getInvalidPcTypes = async () => {
  const response = await api.get('/pcs/invalid-pc-types');
  return response.data;
};

export const cleanupInvalidPcType = async (id) => {
  const response = await api.post(`/pcs/invalid-pc-types/cleanup/${id}`);
  return response.data;
};

export const cleanupAllInvalidPcTypes = async () => {
  const response = await api.post('/pcs/invalid-pc-types/cleanup');
  return response.data;
};