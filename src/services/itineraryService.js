import api from './api';
export const getPublicItineraries = () => api.get('/itineraries');