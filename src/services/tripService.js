import api from './api';
export const fetchTrips = () => api.get('/trips');
export const createTrip = (data) => api.post('/trips', data);