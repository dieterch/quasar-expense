<template>
  <q-page padding>
    <q-card>
      <q-card-section class="row items-center q-pa-sm">
        <div class="text-h6 col">Currencies</div>
        <q-btn flat color="primary" label="Add" @click="openDialog()" class="col-auto" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table :rows="currencies" :columns="columns" row-key="name" dense>
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="openDialog(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click="onDelete(props.row.name)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <CurrenciesDialog v-model:showDialog="showDialog" :currency="editedCurrency" @saved="onSaved" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useCurrencyStore } from "src/stores/currency-store";
import CurrenciesDialog from "src/components/CurrenciesDialog.vue";

const store = useCurrencyStore();
const showDialog = ref(false);
const editedCurrency = ref(null);

const columns = computed(() => [
  { name: "name", label: "Name", field: "name", align: "left" },
  { name: "symbol", label: "Symbol", field: "symbol", align: "left" },
  { name: "factor", label: "Factor", field: "factor", align: "right", format: (v) => Number(v).toFixed(3) },
  { name: "actions", label: "Actions", field: "actions", align: "center" },
]);

const currencies = computed(() => store.currencies || []);

const openDialog = (row = null) => {
  editedCurrency.value = row ? { ...row } : null;
  showDialog.value = true;
};

const onDelete = async (name) => {
  if (!confirm("Delete currency?")) return;
  await store.deleteCurrency(name, { persist: false }); // persist: false = nur lokal
};

const onSaved = async () => {
  showDialog.value = false;
  // falls du persist möchtest: await store.saveToServer();
};

onMounted(async () => {
  // await store.loadFromToml(); // lädt /public/currencies.toml
  await store.getCurrencies();
});
</script>

<style scoped></style>
