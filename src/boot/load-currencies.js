import { boot } from 'quasar/wrappers';
import { useCurrencyStore } from 'src/stores/currency-store';

export default boot(async () => {
  const currencyStore = useCurrencyStore();
  try {
    await currencyStore.getCurrencies();
    console.log('load-currencies: loaded', currencyStore.currencies?.length ?? 0);
  } catch (err) {
    console.error('load-currencies: failed to load currencies', err);
  }
});
