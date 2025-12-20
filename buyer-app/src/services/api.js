// API Service Layer for Online Marketplace Backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if not on login/signup page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(errorMessage));
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),

  login: (credentials) => apiClient.post('/auth/login', credentials),

  deleteAccount: () => apiClient.delete('/auth/delete'),
};

// Public APIs (no auth required)
export const publicAPI = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/public/products${query ? `?${query}` : ''}`);
  },

  getProductById: (id) => apiClient.get(`/public/products/${id}`),

  getProductComments: (id) => apiClient.get(`/public/products/${id}/comments`),

  getCategories: () => apiClient.get('/public/categories'),
};

// Buyer APIs (auth required)
export const buyerAPI = {
  // Cart
  getCart: () => apiClient.get('/buyer/cart'),
  
  addToCart: (productId, quantity = 1) => apiClient.post('/buyer/cart', { productId, quantity }),

  updateCartItem: (productId, quantity) => apiClient.put(`/buyer/cart/${productId}`, { quantity }),

  removeFromCart: (productId) => apiClient.delete(`/buyer/cart/${productId}`),

  clearCart: () => apiClient.delete('/buyer/cart'),

  // Orders
  getOrders: () => apiClient.get('/buyer/orders'),

  createOrder: (orderData) => apiClient.post('/buyer/orders', orderData),

  getOrder: (orderId) => apiClient.get(`/buyer/orders/${orderId}`),

  addOrderComment: (orderId, comment) => apiClient.post(`/buyer/orders/${orderId}/comment`, { comment }),

  // Rating
  rateProduct: (productId, rating, comment) => apiClient.post(`/buyer/products/${productId}/rate`, { rating, comment }),

  // Flag Product/Seller
  flagProduct: (productId, reason) => apiClient.post('/buyer/flags/product', { product: productId, reason }),

  flagSeller: (sellerId, reason) => apiClient.post('/buyer/flags/seller', { seller: sellerId, reason }),

  getBuyerFlags: () => apiClient.get('/buyer/flags'),

  deleteBuyerFlag: (flagId) => apiClient.delete(`/buyer/flags/${flagId}`),

  // Comments
  postProductComment: (productId, body) => apiClient.post(`/buyer/products/${productId}/comment`, { body }),

  // AI Summary
  getAISummary: (productId) => apiClient.get(`/public/products/${productId}/summary`),
};

// Seller APIs (auth required)
export const sellerAPI = {
  // Products
  getMyProducts: () => apiClient.get('/seller/products'),

  createProduct: (productData) => apiClient.post('/seller/products', productData),

  updateProduct: (productId, productData) => apiClient.put(`/seller/products/${productId}`, productData),

  deleteProduct: (productId) => apiClient.delete(`/seller/products/${productId}`),

  // Orders
  getOrders: () => apiClient.get('/seller/orders'),

  updateOrderStatus: (orderId, status) => apiClient.put(`/seller/orders/${orderId}/status`, { status }),
};

export default {
  auth: authAPI,
  public: publicAPI,
  buyer: buyerAPI,
  seller: sellerAPI,
};
