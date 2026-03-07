/**
 * API Service Layer
 * Professional API service matching backend structure
 */

import apiClient from './apiClient';

/**
 * Products API
 */
export const productsAPI = {
    getAll: (params = {}) => apiClient.get('/products', params),
    getById: (id) => apiClient.get(`/products/${id}`),
    create: (productData) => apiClient.post('/products', productData),
    update: (id, productData) => apiClient.put(`/products/${id}`, productData),
    delete: (id) => apiClient.delete(`/products/${id}`),
};

/**
 * Categories API
 */
export const categoriesAPI = {
    getAll: () => apiClient.get('/categories'),
    getById: (id) => apiClient.get(`/categories/${id}`),
    create: (categoryData) => apiClient.post('/categories', categoryData),
    update: (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData),
    delete: (id) => apiClient.delete(`/categories/${id}`),
};

/**
 * Occasions API
 */
export const occasionsAPI = {
    getAll: () => apiClient.get('/occasions'),
    getById: (id) => apiClient.get(`/occasions/${id}`),
    create: (occasionData) => apiClient.post('/occasions', occasionData),
    update: (id, occasionData) => apiClient.put(`/occasions/${id}`, occasionData),
    delete: (id) => apiClient.delete(`/occasions/${id}`),
};

/**
 * Collections API
 */
export const collectionsAPI = {
    getAll: () => apiClient.get('/collections'),
    getById: (id) => apiClient.get(`/collections/${id}`),
    create: (collectionData) => apiClient.post('/collections', collectionData),
    update: (id, collectionData) => apiClient.put(`/collections/${id}`, collectionData),
    delete: (id) => apiClient.delete(`/collections/${id}`),
};

/**
 * Orders API
 */
export const ordersAPI = {
    create: (orderData) => apiClient.post('/orders', orderData),
    getById: (id) => apiClient.get(`/orders/${id}`),
    track: (params) => apiClient.get('/orders/track', { params }),
    getAll: (params = {}) => apiClient.get('/orders', params),
    getMyOrders: (params = {}) => apiClient.get('/orders/my-orders', params),
    updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
};

/**
 * Payment API
 */
export const paymentAPI = {
    verify: (paymentData) => apiClient.post('/payments/verify', paymentData),
};

/**
 * Content API
 */
export const contentAPI = {
    getAll: () => apiClient.get('/content'),
    update: (contentData) => apiClient.put('/content', contentData),
};

/**
 * Admin API
 */
export const adminAPI = {
    getStats: () => apiClient.get('/admin/stats'),
    getCustomers: (params = {}) => apiClient.get('/admin/customers', params),
};

/**
 * Upload API
 */
export const uploadAPI = {
    uploadImage: (formData) => apiClient.post('/upload', formData),
};

/**
 * Authentication API
 */
export const authAPI = {
    // Admin auth
    adminLogin: (credentials) => apiClient.post('/admin/login', credentials),
    getAdminProfile: () => apiClient.get('/admin/profile'),

    // Customer auth
    customerRegister: (userData) => apiClient.post('/auth/register', userData),
    customerLogin: (credentials) => apiClient.post('/auth/login', credentials),
    googleAuth: (googleData) => apiClient.post('/auth/google', googleData),
    getCustomerProfile: () => apiClient.get('/auth/profile'),
    updateCustomerProfile: (profileData) => apiClient.put('/auth/profile', profileData),
};

/**
 * Health Check
 */
export const healthCheck = async () => {
    try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(baseURL.replace('/api', '/health'));
        return await response.json();
    } catch (error) {
        throw new Error('Health check failed');
    }
};

/**
 * Default export with all APIs
 */
export default {
    products: productsAPI,
    categories: categoriesAPI,
    occasions: occasionsAPI,
    collections: collectionsAPI,
    orders: ordersAPI,
    payment: paymentAPI,
    content: contentAPI,
    auth: authAPI,
    admin: adminAPI,
    healthCheck,
};
