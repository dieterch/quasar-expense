import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";

// ----------------
// Helper Functions
// ----------------

// ------
// Store
// ------
export const useCategoryStore = defineStore("category", () => {

  // ----------
  // categories
  // ----------
  const categories = ref();

  // action: load all categories from api
  const getCategories = async () => {
    const response = await api.get("/api/categories");
    categories.value = response.data;
  };

  // action: create or update database row
  const requestCategories = async ( method, payload ) => {
    const response = await api.request('/api/categories', {
        method: method,
        data: payload,
        headers: { "Content-Type": "application/json" },
    })
    // user has to reload database to update data
  }

  // action: delete trip from database
  const deleteCategory = async (id) => {
    await api.delete("/api/categories",{
      data: { id: id},
      headers: { "Content-Type": "application/json" },
    })
  }

  return {
    // Categories
    getCategories,
    requestCategories,
    deleteCategory,
    categories,
  };
});
