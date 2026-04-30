import api from './api';

export const getPublicItineraries = (params = {}) => api.get('/itineraries', { params });
export const getPublicItineraryById = (id) => api.get(`/itineraries/${id}`);

// Reviews
export const getReviewsForTemplate = (templateId) => api.get(`/reviews/template/${templateId}`);
export const addReview = (templateId, data) => api.post(`/reviews/template/${templateId}`, data);
export const updateReview = (reviewId, data) => api.put(`/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);
export const toggleHelpful = (reviewId) => api.put(`/reviews/${reviewId}/helpful`);