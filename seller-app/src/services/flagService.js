import apiClient from './api'

export const flagService = {
  // Create flag against a buyer
  createFlag: (buyerId, reason, orderId) => {
    return apiClient.post('/seller/flags', {
      targetUser: buyerId,
      reason,
      orderId
    })
  },

  // Get seller's flags (you'll need to implement this endpoint on backend)
  getSellerFlags: () => {
    return apiClient.get('/seller/flags')
  }
}
