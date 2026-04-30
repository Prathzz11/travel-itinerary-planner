import api from './api';

export const getItinerary = (tripId) => api.get(`/trips/${tripId}/itinerary`);
export const updateItinerary = (tripId, data) => api.put(`/trips/${tripId}/itinerary`, data);

// Public itinerary templates (Browse/Explore page)
export const getPublicItineraries = (params = {}) => api.get('/itineraries', { params });
export const getPublicItineraryById = (id) => api.get(`/itineraries/${id}`);