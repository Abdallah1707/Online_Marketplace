// seller-app/src/services/orderService.js
import apiClient from "./api";

export const orderService = {
  /**
   * Seller: list orders
   * GET /api/seller/orders?status=... [file:21]
   */
  getSellerOrders: async (status) => {
    const params = {};
    if (status && String(status).trim() !== "") params.status = status;
    const { data } = await apiClient.get("/seller/orders", { params });
    return data;
  },

  /**
   * Seller: update order status
   * PUT /api/seller/orders/:id/status
   */
  updateOrderStatus: async (orderId, status) => {
    const { data } = await apiClient.put(`/seller/orders/${orderId}/status`, { status });
    return data;
  },
};

export default orderService;
