import api from './api';
export const getExpenses = (tripId) => api.get(`/trips/${tripId}/expenses`);