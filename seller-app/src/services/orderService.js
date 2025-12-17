import apiClient from './api'

export const orderService = {
  // Get seller's orders (you'll need to implement this endpoint on backend)
  getSellerOrders: () => {
    return apiClient.get('/seller/orders')
  },

  // Update order status
  updateOrderStatus: (orderId, status) => {
    return apiClient.put(`/seller/orders/${orderId}`, {
      status
    })
  },

  // Get single order
  getOrder: (id) => {
    return apiClient.get(`/seller/orders/${id}`)
  }
}
