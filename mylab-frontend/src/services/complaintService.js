import api from './api';

export const createComplaint = async (complaintData) => {
  const response = await api.post('/complaints', complaintData);
  return response.data;
};

export const getComplaintsByPC = async (pcId) => {
  const response = await api.get(`/complaints/pc/${pcId}`);
  return response.data;
};

export const getAllComplaints = async () => {
  const response = await api.get('/complaints');
  return response.data;
};

export const updateComplaintStatus = async (id, status, remarks = null) => {
  const body = { status };
  if (remarks) body.remarks = remarks;
  const response = await api.put(`/complaints/${id}/status`, body);
  return response.data;
};
