// API Service Layer for Online Marketplace Backend
const API_BASE_URL = 'http://localhost:4000/api';

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiRequest('/auth/profile'),
};

// Public APIs (no auth required)
export const publicAPI = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/public/products${query ? `?${query}` : ''}`);
  },

  getProductById: (id) => apiRequest(`/public/products/${id}`),

  getCategories: () => apiRequest('/public/categories'),
};

// Buyer APIs (auth required)
export const buyerAPI = {
  // Cart
  getCart: () => apiRequest('/buyer/cart'),
  
  addToCart: (productId, quantity = 1) =>
    apiRequest('/buyer/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  updateCartItem: (productId, quantity) =>
    apiRequest(`/buyer/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (productId) =>
    apiRequest(`/buyer/cart/${productId}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    apiRequest('/buyer/cart', {
      method: 'DELETE',
    }),

  // Orders
  getOrders: () => apiRequest('/buyer/orders'),

  getOrderById: (orderId) => apiRequest(`/buyer/orders/${orderId}`),

  createOrder: (orderData) =>
    apiRequest('/buyer/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Ratings
  rateProduct: (productId, rating, review) =>
    apiRequest(`/buyer/products/${productId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    }),

  // Flags
  flagProduct: (productId, reason) =>
    apiRequest(`/buyer/products/${productId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  flagSeller: (sellerId, reason) =>
    apiRequest(`/buyer/flags/seller`, {
      method: 'POST',
      body: JSON.stringify({ seller: sellerId, reason }),
    }),

  // AI Summary
  getAISummary: (productId) =>
    apiRequest(`/public/products/${productId}/summary`),
};

// Seller APIs (auth required)
export const sellerAPI = {
  // Products
  getMyProducts: () => apiRequest('/seller/products'),

  createProduct: (productData) =>
    apiRequest('/seller/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (productId, productData) =>
    apiRequest(`/seller/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (productId) =>
    apiRequest(`/seller/products/${productId}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: () => apiRequest('/seller/orders'),

  updateOrderStatus: (orderId, status) =>
    apiRequest(`/seller/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

export default {
  auth: authAPI,
  public: publicAPI,
  buyer: buyerAPI,
  seller: sellerAPI,
};
