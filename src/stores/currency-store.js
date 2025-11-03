import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useCurrencyStore = defineStore("currency", () => {
  const currencies = ref([]);

  const getCurrencies = async () => {
    const response = await api.get("/api/currencies");
    currencies.value = response.data || [];
  };

  // method: 'POST' = create, 'PUT' = update
  const requestCurrency = async (method, payload) => {
    await api.request("/api/currencies", {
      method,
      data: payload,
    });
    // optional: refresh list after change
    await getCurrencies();
  };

  const deleteCurrency = async (id) => {
    await api.delete("/api/currencies", {
      data: { id },
    });
    await getCurrencies();
  };

  const currencyOptions = computed(() =>
    currencies.value.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.name }))
  );

  return {
    currencies,
    getCurrencies,
    requestCurrency,
    deleteCurrency,
    currencyOptions,
  };
});
