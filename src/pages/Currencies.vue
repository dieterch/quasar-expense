<template>
  <q-page padding>
    <q-card>
      <q-card-section class="row items-center q-pa-sm">
        <div class="text-h6 col">Currencies</div>
        <q-btn flat color="primary" label="Add" @click="openDialog()" class="col-auto" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="currencies"
          :columns="columns"
          row-key="id"
          dense
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="openDialog(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click="onDelete(props.row.id)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <CurrencyDialog
      v-model:showDialog="showDialog"
      :currency="editedCurrency"
      @saved="onSaved"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from "vue";
//import { useCurrencyStore } from "src/stores/currency-store";
import { useCurrencyMockStore } from "src/stores/currency-mock-store";
import CurrencyDialog from "src/components/CurrencyDialog.vue";

// const store = useCurrencyStore();
const store = useCurrencyMockStore();
const showDialog = ref(false);
const editedCurrency = ref(null);

const columns = computed(() => [
  { name: "name", label: "Name", field: "name", align: "left" },
  { name: "symbol", label: "Symbol", field: "symbol", align: "left" },
  { name: "factor", label: "Factor", field: "factor", align: "right", format: (v) => Number(v).toFixed(2) },
  { name: "actions", label: "Actions", field: "actions", align: "center" },
]);

const currencies = computed(() => store.currencies || []);

const openDialog = (row = null) => {
  editedCurrency.value = row ? { ...row } : null;
  showDialog.value = true;
};

const onDelete = async (id) => {
  if (!confirm("Delete currency?")) return;
  await store.deleteCurrency(id);
};

const onSaved = async () => {
  // store already refreshed in request; close dialog if still open
  showDialog.value = false;
};

store.getCurrencies();
</script>

<style scoped>
</style>
