import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useCurrencyStore = defineStore("currency", () => {
  const currencies = ref([]);

  const getCurrencies = async () => {
    const response = await api.get("/api/currency");
    currencies.value = response.data || [];
  };

  // method: 'POST' = create, 'PUT' = update
  const requestCurrency = async (method, payload) => {
    await api.request("/api/currency", {
      method,
      data: payload,
    });
    // optional: refresh list after change
    await getCurrencies();
  };

  // --- added wrappers for dialog code that calls createCurrency/updateCurrency
  const createCurrency = async (payload) => {
    return await requestCurrency("POST", payload);
  };

  // Accept (name, payload) or a single payload that already contains name
  const updateCurrency = async (nameOrPayload, maybePayload) => {
    let body;
    if (typeof nameOrPayload === "object" && nameOrPayload !== null) {
        // called as updateCurrency(payloadWithName)
        body = nameOrPayload;
      } else {
        // called as updateCurrency(name, payload)
        body = { name: nameOrPayload, ...(maybePayload || {}) };
    }
    return await requestCurrency("PUT", body);
  };

  const deleteCurrency = async (name) => {
    // sendet nun { name } statt { id } – Backend muss entsprechend name erwarten
    await api.delete("/api/currency", {
      data: { name },
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
    createCurrency,
    updateCurrency,
    deleteCurrency,
    currencyOptions,
  };
});
