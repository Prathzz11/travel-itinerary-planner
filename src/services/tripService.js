import api from './api';

export const fetchTrips = () => api.get('/trips');
export const fetchTripById = (id) => api.get(`/trips/${id}`);
export const createTrip = (data) => api.post('/trips', data);
export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);

// Member management
export const addMember = (tripId, data) => api.post(`/trips/${tripId}/members`, data);
export const updateMemberRole = (tripId, memberId, role) => api.put(`/trips/${tripId}/members/${memberId}`, { role });
export const removeMember = (tripId, memberId) => api.delete(`/trips/${tripId}/members/${memberId}`);