import api from './api.js';

const get = async (url, params) => (await api.get(url, { params })).data;

export const getDashboardStats = () => get('/business/dashboard');
export const getAnalytics = (months = 6) => get('/business/analytics', { months });
export const getRecentProducts = (params) => get('/business/recent-products', params);
export const getRecentRequests = (params) => get('/business/recent-requests', params);
export const getExpiryAlerts = (params) => get('/business/expiry-alerts', params);
export const getActivity = (params) => get('/business/activity', params);

export const getBusinessProfile = () => get('/business/profile');
// Accepts FormData so a new profile photo can be included
export const updateBusinessProfile = async (formData) =>
  (await api.put('/business/profile', formData)).data;

export const getNotifications = (params) => get('/business/notifications', params);
export const markNotificationRead = async (id) =>
  (await api.put(`/business/notifications/${id}/read`)).data;
export const markAllNotificationsRead = async () =>
  (await api.put('/business/notifications/read-all')).data;