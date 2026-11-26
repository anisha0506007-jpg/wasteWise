import api from './api.js';

export const registerUser = async (formData) => (await api.post('/auth/register', formData)).data;

export const loginUser = async (credentials) => (await api.post('/auth/login', credentials)).data;

export const logoutUser = async () => (await api.post('/auth/logout')).data;

export const getCurrentUser = async () => (await api.get('/auth/me')).data;

// For the future profile page (accepts FormData so a photo can be included)
export const updateProfile = async (formData) => (await api.put('/auth/profile', formData)).data;

export const forgotPassword = async (email) =>
  (await api.post('/auth/forgot-password', { email })).data;

export const resetPassword = async (payload) =>
  (await api.post('/auth/reset-password', payload)).data;