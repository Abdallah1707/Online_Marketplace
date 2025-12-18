import api from "./api";

export const categoryService = {
  list: async () => {
    const { data } = await api.get("/public/categories");
    return data;
  },

  listPublic: async () => {
    return categoryService.list();
  },

  createSeller: async ({ name, description }) => {
    const { data } = await api.post("/seller/categories", { name, description });
    return data;
  },

  deleteSeller: async (categoryId) => {
    const { data } = await api.delete(`/seller/categories/${categoryId}`);
    return data;
  },
};
