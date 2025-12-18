import api from "./api";

export const publicCatalogService = {
  listProducts: async (params) => {
    const { data } = await api.get("/public/products", { params });
    return data;
  },
  search: async (q) => {
    const { data } = await api.get("/public/search", { params: { q } });
    return data;
  },
  getProduct: async (id) => {
    const { data } = await api.get(`/public/products/${id}`);
    return data;
  },
  getSummary: async (id) => {
    const { data } = await api.get(`/public/products/${id}/summary`);
    return data;
  },
};
