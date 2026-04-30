import api from './api';

export const getBookings = (tripId) => api.get(`/trips/${tripId}/bookings`);
export const createBooking = (tripId, data) => api.post(`/trips/${tripId}/bookings`, data);
export const updateBooking = (tripId, bookingId, data) => api.put(`/trips/${tripId}/bookings/${bookingId}`, data);
export const deleteBooking = (tripId, bookingId) => api.delete(`/trips/${tripId}/bookings/${bookingId}`);
