import apiClient from './api'

export const productService = {
  // Get seller's products
  getSellerProducts: () => {
    return apiClient.get('/seller/products')
  },

  // Create product
  createProduct: (title, description, price, category) => {
    return apiClient.post('/seller/products', {
      title,
      description,
      price,
      category
    })
  },

  // Update product
  updateProduct: (id, data) => {
    return apiClient.put(`/seller/products/${id}`, data)
  },

  // Delete product
  deleteProduct: (id) => {
    return apiClient.delete(`/seller/products/${id}`)
  },

  // Get all categories
  getCategories: () => {
    return apiClient.get('/public/categories')
  },

  // Create category
  createCategory: (name, description) => {
    return apiClient.post('/seller/categories', {
      name,
      description
    })
  },

  // Delete category
  deleteCategory: (id) => {
    return apiClient.delete(`/seller/categories/${id}`)
  }
}
