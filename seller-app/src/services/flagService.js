// seller-app/src/services/flagService.js
import apiClient from "./api";

export const flagService = {
  /**
   * NEW (matches backend):
   * POST /api/seller/flags/buyer [file:18]
   * Body can include buyerId + reason (+ optional orderId if your backend supports it).
   */
  flagBuyer: ({ buyerId, reason, orderId }) => {
    return apiClient.post("/seller/flags/buyer", {
      buyerId,
      reason,
      orderId,
    });
  },

  /**
   * Keep old method so nothing else breaks (your previous frontend used this).
   * POST /api/seller/flags [file:18]
   */
  createFlag: (buyerId, reason, orderId) => {
    return apiClient.post("/seller/flags", {
      targetUser: buyerId,
      reason,
      orderId,
    });
  },
};

export default flagService;
