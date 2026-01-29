import api from './api';

export const getDefectHistoryByPC = async (pcId) => {
  const response = await api.get(`/defect-history/pc/${pcId}`);
  return response.data;
};
