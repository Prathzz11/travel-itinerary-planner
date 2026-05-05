import api from './api';

export const getSettlements = (tripId) => api.get(`/trips/${tripId}/settlements`);
export const createSettlement = (tripId, data) => api.post(`/trips/${tripId}/settlements`, data);
export const deleteSettlement = (tripId, settlementId) => api.delete(`/trips/${tripId}/settlements/${settlementId}`);