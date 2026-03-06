import api from './api';

export const getSchedulesByLab = async (labId) => {
    const response = await api.get(`/schedules/lab/${labId}`);
    return response.data;
};

export const createSchedule = async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
};

export const deleteSchedule = async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
};

export const getLabStatus = async (labId) => {
    const response = await api.get(`/schedules/status/${labId}`);
    return response.data;
};
