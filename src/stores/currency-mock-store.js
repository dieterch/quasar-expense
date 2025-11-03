import { ref, computed } from "vue";
import { defineStore } from "pinia";

// Mock-Daten
const initialCurrencies = [
  { name: "USD", symbol: "$", factor: 0.92 },
  { name: "GBP", symbol: "£", factor: 1.23 },
  { name: "EUR", symbol: "€", factor: 1.0 }, // Bezugswährung
];

export const useCurrencyMockStore = defineStore("currency-mock", () => {
  const currencies = ref(initialCurrencies.map((c) => ({ ...c })));

  const getCurrencies = async () => {
    // Simuliere asynchrone API
    return new Promise((resolve) => {
      resolve(currencies.value);
    });
  };

  // method: 'POST' = create, 'PUT' = update
  const requestCurrency = async (method, payload) => {
    if (method === "POST") {
      // Vermeide Duplikate nach name
      if (!currencies.value.find((c) => c.name === payload.name)) {
        currencies.value.push({ ...payload });
      }
    } else if (method === "PUT") {
      const idx = currencies.value.findIndex((c) => c.name === payload.name);
      if (idx !== -1) {
        currencies.value[idx] = { ...currencies.value[idx], ...payload };
      } else {
        // falls noch nicht vorhanden, anfügen
        currencies.value.push({ ...payload });
      }
    }
    return currencies.value;
  };

  // Löschen nach name
  const deleteCurrency = async (name) => {
    currencies.value = currencies.value.filter((c) => c.name !== name);
    return currencies.value;
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
