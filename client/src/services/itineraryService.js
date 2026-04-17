import api from '../api';

export const getPublicItineraries = (params) => api.get('/itineraries/public', { params });
export const getPublicItinerary = (id) => api.get(`/itineraries/public/${id}`);
export const forkItinerary = (id, data) => api.post(`/itineraries/${id}/fork`, data);
export const addReview = (id, data) => api.post(`/itineraries/${id}/review`, data);
export const getReviews = (id) => api.get(`/itineraries/${id}/reviews`);
export const getMyTemplates = () => api.get('/itineraries/my-templates');
export const updateTemplate = (id, data) => api.put(`/itineraries/${id}/template`, data);
export const getRelatedItineraries = (id) => api.get(`/itineraries/related/${id}`);
