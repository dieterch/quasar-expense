<template>
  <q-dialog v-model="localShow" persistent>
    <q-card style="min-width: 350px; max-width: 600px;">
      <q-card-section>
        <div class="text-h6">{{ isEdit ? 'Edit Currency' : 'New Currency' }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSave" ref="formRef">
          <q-input v-model="form.name" label="Name" required />
          <q-input v-model="form.symbol" label="Symbol" required class="q-mt-sm" />
          <q-input
            v-model.number="form.factor"
            label="Factor (to EUR)"
            type="number"
            step="0.01"
            required
            class="q-mt-sm"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup @click="close" />
        <q-btn flat label="Save" color="primary" @click="onSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
// import { useCurrencyStore } from "src/stores/currency-store";
import { useCurrencyMockStore } from "src/stores/currency-mock-store";

const props = defineProps({
  showDialog: { type: Boolean, required: true },
  currency: { type: Object, default: null },
});
const emit = defineEmits(["update:showDialog", "saved"]);

// const store = useCurrencyStore();
const store = useCurrencyMockStore();

const localShow = ref(props.showDialog);
watch(() => props.showDialog, (v) => (localShow.value = v));
watch(localShow, (v) => emit("update:showDialog", v));

const form = ref({
  id: null,
  name: "",
  symbol: "",
  factor: 1.0,
});

watch(
  () => props.currency,
  (c) => {
    if (c) {
      form.value = { id: c.id ?? null, name: c.name, symbol: c.symbol, factor: Number(c.factor) };
    } else {
      form.value = { id: null, name: "", symbol: "", factor: 1.0 };
    }
  },
  { immediate: true }
);

const isEdit = computed(() => !!form.value.id);

const onSave = async () => {
  const payload = { ...form.value };
  const method = isEdit.value ? "PUT" : "POST";
  await store.requestCurrency(method, payload);
  emit("saved");
};

const close = () => {
  localShow.value = false;
};
</script>

<style scoped>
.q-mt-sm { margin-top: 8px; }
</style>
