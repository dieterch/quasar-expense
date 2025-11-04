import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { parse } from "toml"; // browserfreundlich

export const useCurrencyStore = defineStore("currency", () => {
  const currencies = ref([]);

  // Lade currencies.toml aus /public
  const loadFromToml = async (path = "/currencies.toml") => {
    try {
      console.log("loadFromToml: fetching", path);
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
      const txt = await res.text();
      // parse mit 'toml' (parse liefert ein Objekt)
      const parsed = parse(txt);
      const list = parsed.currencies || parsed;
      currencies.value = Array.isArray(list) ? list : Object.values(list || {});
      console.log("loadFromToml: parsed currencies", currencies.value);
      return currencies.value;
    } catch (err) {
      console.error("loadFromToml:", err);
      return currencies.value;
    }
  };

  // CRUD lokal (optional: send to server endpoint)
  const createCurrency = async (item) => {
    currencies.value.push({ ...item });
  };

  const updateCurrency = async (name, patch) => {
    const idx = currencies.value.findIndex((c) => c.name === name);
    if (idx !== -1) currencies.value[idx] = { ...currencies.value[idx], ...patch };
  };

  const deleteCurrency = async (name) => {
    currencies.value = currencies.value.filter((c) => c.name !== name);
  };

  const currencyOptions = computed(() =>
    currencies.value.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.name }))
  );

  return {
    currencies,
    loadFromToml,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    currencyOptions,
  };
});
