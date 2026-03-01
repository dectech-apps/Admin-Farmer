import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'https://farmers.api.dectechgh.com/api/v1';
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
  getRiderDetails: (riderId) => api.get(`/admin/riders/${riderId}`),
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
  // System Users
  getSystemUsers: (params) => api.get('/admin/system-users', { params }),
  getSystemUserDetails: (userId) => api.get(`/admin/system-users/${userId}`),
  createSystemUser: (data) => api.post('/admin/system-users', data),
  updateSystemUser: (userId, data) => api.patch(`/admin/system-users/${userId}`, data),
  deleteSystemUser: (userId) => api.delete(`/admin/system-users/${userId}`),
  getAvailablePermissions: () => api.get('/admin/system-users/permissions'),
  // Regular User Management (Edit/Delete)
  updateFarmer: (farmerId, data) => api.patch(`/admin/farmers/${farmerId}`, data),
  deleteFarmer: (farmerId) => api.delete(`/admin/farmers/${farmerId}`),
  updateRestaurant: (restaurantId, data) => api.patch(`/admin/restaurants/${restaurantId}`, data),
  deleteRestaurant: (restaurantId) => api.delete(`/admin/restaurants/${restaurantId}`),
  updateRider: (riderId, data) => api.patch(`/admin/riders/${riderId}`, data),
  deleteRider: (riderId) => api.delete(`/admin/riders/${riderId}`),
  updateRiderVerification: (riderId, action, rejectionReason) => api.patch(`/admin/riders/${riderId}/verify`, { action, rejectionReason }),
  updateCustomer: (customerId, data) => api.patch(`/admin/customers/${customerId}`, data),
  deleteCustomer: (customerId) => api.delete(`/admin/customers/${customerId}`),
  // Products
  getProductsStats: () => api.get('/admin/products/stats'),
  getProductsTrends: (period) => api.get('/admin/products/trends', { params: { period } }),
  getProducts: (params) => api.get('/admin/products', { params }),
  getProductDetails: (productId, type) => api.get(`/admin/products/${productId}`, { params: { type } }),
  updateProduct: (productId, type, data) => api.patch(`/admin/products/${productId}`, data, { params: { type } }),
  deleteProduct: (productId, type) => api.delete(`/admin/products/${productId}`, { params: { type } }),
  // Boutiques
  getBoutiques: (params) => api.get('/admin/boutiques', { params }),
  getBoutiqueDetails: (boutiqueId) => api.get(`/admin/boutiques/${boutiqueId}`),
  updateBoutiqueVerification: (boutiqueId, isVerified) => api.patch(`/admin/boutiques/${boutiqueId}/verify`, { isVerified }),
  updateBoutique: (boutiqueId, data) => api.patch(`/admin/boutiques/${boutiqueId}`, data),
  deleteBoutique: (boutiqueId) => api.delete(`/admin/boutiques/${boutiqueId}`),
};

export default api;
