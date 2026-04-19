import api from './api';
export const getActivities = (tripId) => api.get(`/trips/${tripId}/activities`);