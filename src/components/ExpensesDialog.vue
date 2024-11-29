<template>
  <q-dialog
    v-model="ldialog"
    @show="validate"
  >
    <q-card class="q-pa-md" style="width: 480px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          {{ modeis("add") ? "Add Expense" : "Update Expense" }}
        </div>
      </q-card-section>
      <q-form
        ref="expenseForm"
        class="q-gutter-md"
        @submit.prevent="onSubmit"
      >
        <div class="row">
          <div class="col-6">
            <q-input
              filled
              dense
              v-model="lexpense.description"
              label="Title*"
              lazy-rules
              :rules="[(v) => !!v || 'Description is required']"
              @blur="validate"
            />
          </div>

          <div class="col q-ml-md">
            <q-select
              v-model="lexpense.category"
              dense
              label="Category"
              :options="dialogcategories"
              nooption-label="name"
              nooption-value="id"
              filled
              :rules="[(v) => !!v || 'Category is required']"
              use-chips
              @blur="validate"
            >
              <template v-slot:selected-item="scope">
                <q-chip
                  square
                  dense
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  noclass="q-ma-none q-pl-md"
                  :label="scope.opt.name"
                  :icon = "scope.opt.icon"
                  style=" background: transparent;"
                />
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar side>
                    <q-icon :name="scope.opt.icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="row">
          <div class="col-4">
            <q-select
              filled
              dense
              v-model="lexpense.currency"
              :options="currencies"
              option-label="symbol"
              option-value="symbol"
              label="Currency"
              :rules="[(v) => !!v || 'Currency is required']"
              @blur="validate"
            />
          </div>
          <div class="col q-ml-md">
            <q-input
              filled
              dense
              v-model="lexpense.amount"
              type="number"
              label="Amount"
              :rules="[(v) => !!v || 'Amount is required']"
              @blur="validate"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-4">
            <q-select
              filled
              dense
              v-model="lexpense.user"
              :options="dialogusers"
              option-label="name"
              option-value="id"
              label="User"
              :rules="[(v) => !!v || 'User is required']"
              @blur="validate"
            />
          </div>
          <div class="col q-ml-md" style="max-width: 300px">
            <q-input
              filled
              dense
              v-model="lexpense.date"
              label="Date"
              :rules="[(v) => !!v || 'Date is required']"
              @blur="validate"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="lexpense.date"
                      mask="DD.MM.YYYY"
                      title="Expense Date"
                      :subtitle="lexpense.date"
                      >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Ok" color="primary" flat />
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn
            v-if="modeis('add')"
            label="Add"
            type="submit"
            color="primary"
            :disabled="!isFormValid"
          />
          <q-btn
            v-if="modeis('update')"
            label="Update"
            type="submit"
            color="primary"
            :disabled="!isFormValid"
          />
          <q-btn
            label="Close"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
            @click="onReset"
            v-close-popup
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { date } from 'quasar'
const { extractDate } = date // extract only the function you need => enables tree shaking
import { useExpenseStore } from "stores/expense-store";
const storeExpense = useExpenseStore();

const props = defineProps(["selectedTrip", "dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

// Dropdown data
const dialogcategories = ref([]);
const dialogusers = ref([]);
const currencies = [
  { name: "USD", symbol: "$", factor: 0.92 },
  { name: "EUR", symbol: "€", factor: 1.0 }, // Bezugswährung
];

// Form reference
const expenseForm = ref(null);

// Mode toggle
// const isAddMode = (props.mode === 'add');
const modeis = (e) => props.mode === e;


// Form validity tracker
const isFormValid = ref(false);

// Helper for determining dialog visibility and mode
const ldialog = computed({
  get: () => props.dialog,
  set: (value) => emit("dialog", value),
});

// Form data
const lexpense = ref({})

const validate = async () => {
  console.log('in validate')
  isFormValid.value = await expenseForm.value.validate();
}

// Reset Form
const resetForm = async () => {
  lexpense.value = {
    // ...lexpense.value,
    // amount: null,
    currency: "€",
    date: date.formatDate(new Date(),'DD.MM.YYYY'),
    // description: "",
  };
};

// Fetch Data on Mount
onMounted(async () => {
  if (props.selectedTrip.id != 0) {
    await storeExpense.postTripUsers(props.selectedTrip.id);
    dialogusers.value = storeExpense.users.map((item) => item.user );
  }

  await storeExpense.getCategories();
  dialogcategories.value = storeExpense.categories.map((item) => {
    return {
      id: item.id,
      name: item.name,
      icon: item.icon,
    };
  });

  switch (props.mode) {
    case "add":
      onReset();
      //resetForm();
      break;
    case "update":
      lexpense.value = {
        // ...lexpense.value,
        id: props.item.id,
        amount: props.item.amount,
        currency: props.item.currency,

        date: date.formatDate(new Date(props.item.date),'DD.MM.YYYY'),
        location: props.item.location,
        category: {
          id: props.item.categoryId,
          name: props.item.categoryName,
          icon: props.item.categoryIcon
        },
        description: props.item.description,
        tripId: props.item.tripId,
        user: props.item.user,
        userId: props.item.userId,
      };
      break;
  }
});

// Form submission handler
const onSubmit = async () => {
  if (isFormValid.value) {
    console.log('Form is valid:', lexpense.value);
    // Perform your submit logic here
    await handleForm(modeis('add') ? 'POST':'PUT')
  } else {
    console.log('Form is invalid.');
  }
};

// Reset form
const onReset = () => {
  lexpense.value = {
    description: '',
    category: null,
    amount: null,
    user: null,
    currency: "€",
    date: date.formatDate(new Date(),'DD.MM.YYYY'),
  };
  expenseForm.value.resetValidation();
  isFormValid.value = false;
};

/////////////////////////////////////////
const handleForm = async (method) => {
  if (!isFormValid.value) return;
  const ds = lexpense.value.date.split('.') // 29.11.2024 => ['29,'11','2024']
  let payload = {};
  if (method === "POST") {
    payload = {
      amount: parseFloat(lexpense.value.amount),
      date: `${ds[2]}-${ds[1]}-${ds[0]}T00:00:00.000Z`,
      location: "",
      currency: lexpense.value.currency,
      description: lexpense.value.description,
      trip: { connect: { id: props.selectedTrip.id } },
      user: { connect: { id: lexpense.value.user.id } },
      category: { connect: { id: lexpense.value.category.id } },
    };
  }

  if (method === "PUT") {
    payload = {
      ...lexpense.value,
      amount: parseFloat(lexpense.value.amount),
    };
  }

  console.log('method:',method)
  console.log('payload:',JSON.stringify(payload, null,2))
  // Send data to API
  try {
    await storeExpense.requestExpenses(method, payload);
    resetForm();
    emit("refresh");
    closeDialog();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(error);
  }
};

// Close Dialog without Submission of data
const closeDialog = () => {
  resetForm();
  emit("dialog", false);
};
</script>
