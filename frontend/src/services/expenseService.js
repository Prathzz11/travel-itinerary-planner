import api from './api';

export const getExpenses = (tripId) => api.get(`/trips/${tripId}/expenses`);
export const createExpense = (tripId, data) => api.post(`/trips/${tripId}/expenses`, data);
export const updateExpense = (tripId, expenseId, data) => api.put(`/trips/${tripId}/expenses/${expenseId}`, data);
export const deleteExpense = (tripId, expenseId) => api.delete(`/trips/${tripId}/expenses/${expenseId}`);