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

export const getAllSchedules = async () => {
    const response = await api.get('/schedules/all');
    return response.data;
};

export const getFreeLabs = async (dayOfWeek, startTime, endTime) => {
    const response = await api.get('/schedules/free-labs', {
        params: { dayOfWeek, startTime, endTime }
    });
    return response.data;
};

export const getLabStatus = async (labId) => {
    const response = await api.get(`/schedules/status/${labId}`);
    return response.data;
};
