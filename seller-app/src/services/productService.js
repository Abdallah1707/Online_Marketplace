// seller-app/src/services/productService.js
import api from "./api";

/**
 * Helper: build payload without sending empty category "" (causes ObjectId cast error).
 * Backend expects category to be a Mongo ObjectId string, or absent/null. [file:13]
 */
function buildProductPayload(input) {
  const payload = {
    title: input.title?.trim(),
    description: input.description ?? "",
    price: input.price,
  };

  // Only include category if it's a non-empty string
  if (input.category && String(input.category).trim() !== "") {
    payload.category = String(input.category).trim();
  }

  // Add delivery estimate in days
  if (input.deliveryDays != null) {
    payload.deliveryDays = Number(input.deliveryDays);
  }

  return payload;
}

export const productService = {
  /**
   * Seller: list products for logged-in seller
   * GET /api/seller/products [file:5]
   */
  getSellerProducts: async () => {
    const { data } = await api.get("/seller/products");
    return data;
  },

  /**
   * Alias for backward compatibility
   */
  listMyProducts: async () => {
    return productService.getSellerProducts();
  },

  /**
   * Seller: create product
   * POST /api/seller/products [file:5]
   */
  createProduct: async (productInput) => {
    const payload = buildProductPayload(productInput);
    const { data } = await api.post("/seller/products", payload);
    return data;
  },

  /**
   * Seller: update product
   * PUT /api/seller/products/:id [file:5]
   */
  updateProduct: async (productId, productInput) => {
    const payload = buildProductPayload(productInput);
    const { data } = await api.put(`/seller/products/${productId}`, payload);
    return data;
  },

  /**
   * Seller: delete product
   * DELETE /api/seller/products/:id [file:5]
   */
  deleteProduct: async (productId) => {
    const { data } = await api.delete(`/seller/products/${productId}`);
    return data;
  },
};

export default productService;
