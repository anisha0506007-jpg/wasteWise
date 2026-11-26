import api from './api.js';

// Create and update take FormData so the product image can be included
export const createProduct = async (formData) => (await api.post('/products', formData)).data;

export const getMyProducts = async (params) =>
  (await api.get('/products/my-products', { params })).data;

export const getProduct = async (id) => (await api.get(`/products/${id}`)).data;

export const updateProduct = async (id, formData) =>
  (await api.put(`/products/${id}`, formData)).data;

// status: 'available' | 'unavailable'
export const updateProductStatus = async (id, status) =>
  (await api.patch(`/products/${id}/status`, { status })).data;

export const deleteProduct = async (id) => (await api.delete(`/products/${id}`)).data;