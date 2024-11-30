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

  return {
    // Categories
    getCategories,
    categories,
  };
});
