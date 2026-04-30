import api from './api';

export const login = async (data) => {
  return api.post('/auth/login', data);
};

export const signup = async (data) => {
  return api.post('/auth/signup', data);
};

export const getMe = async () => {
  return api.get('/auth/me');
};

export const updateMe = async (data) => {
  return api.put('/auth/me', data);
};