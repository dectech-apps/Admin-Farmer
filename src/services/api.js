import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

// Admin Dashboard
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFarmers: (params) => api.get('/admin/farmers', { params }),
  getFarmerDetails: (farmerId) => api.get(`/admin/farmers/${farmerId}`),
  getRiders: (params) => api.get('/admin/riders', { params }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getRevenueAnalytics: (period) => api.get('/admin/analytics/revenue', { params: { period } }),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  updateFarmVerification: (farmId, isVerified) => api.patch(`/admin/farms/${farmId}/verify`, { isVerified }),
  // Restaurants
  getRestaurants: (params) => api.get('/admin/restaurants', { params }),
  getRestaurantDetails: (restaurantId) => api.get(`/admin/restaurants/${restaurantId}`),
  updateRestaurantVerification: (restaurantId, isVerified) => api.patch(`/admin/restaurants/${restaurantId}/verify`, { isVerified }),
  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentAnalytics: (period) => api.get('/admin/analytics/payments', { params: { period } }),
};

export default api;
