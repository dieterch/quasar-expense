<template>
  <q-dialog v-model="ldialog">
    <!--q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">{{ modeis('add') ? 'Add Expense' : 'Update Expense' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
        </q-card-section>

        <q-card-section class="q-pt-none">
            <pre>{{  props }}</pre>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="OK" v-close-popup />
        </q-card-actions>
      </q-card-->

    <!--div class="q-pa-md" style="max-width: 400px"-->
    <q-card class="q-pa-md" style="width: 500px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          {{ modeis("add") ? "Add Expense" : "Update Expense" }}
        </div>
      </q-card-section>
      <q-form
        ref="expenseForm"
        @validation-success="debugme"
        @validation-error="debugme"
        no-v-model="isFormValid"
        no-lazy-validation
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
        <div class="row">
          <div class="col-6">
            <q-input
              filled
              dense
              v-model="lexpense.description"
              label="Title*"
              lazy-rules
              required
              :rules="[(v) => !!v || 'Description is required']"
            />
          </div>

          <div class="col q-ml-md">
            <q-select
              v-model="lexpense.categoryId"
              dense
              label="Category"
              :options="dialogcategories"
              option-label="name"
              option-value="id"
              filled
              required
              :rules="[(v) => !!v || 'required']"
            >
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

        <!-- Currency Dropdown -->
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
              required
              :rules="[(v) => !!v || 'required']"
            />
          </div>

          <!-- Amount Input -->
          <div class="col q-ml-md">
            <q-input
              filled
              dense
              v-model="lexpense.amount"
              type="number"
              label="Amount"
              required
              :rules="[(v) => !!v || 'Amount is required']"
            />
          </div>
        </div>

        <div class="row">
          <!-- User Dropdown -->
          <div class="col-4">
            <q-select
              filled
              dense
              v-model="lexpense.user"
              :options="dialogusers"
              option-label="name"
              option-value="id"
              label="User"
              required
              :rules="[(v) => !!v || 'User is required']"
            />
          </div>

          <div class="col q-ml-md" style="max-width: 300px">
            <q-input
              filled
              dense
              v-model="lexpense.date"
              nomask="date"
              :norules="['date']"
              :rules="[(v) => !!v || 'Date is required']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="lexpense.date"
                      mask="DD.MM.YYYY"
                      title="Expense Date"
                      :subtitle="lexpense.date"
                      >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
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
            v-close-popup />
          <q-btn
            v-if="modeis('update')"
            label="Update"
            type="submit"
            color="primary"
            :disabled="!isFormValid"
            v-close-popup />
          <q-btn
            label="Close"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
            v-close-popup />
        </q-card-actions>
      </q-form>
      <pre>{{ dialogusers }}</pre>
    </q-card>
  </q-dialog>

    <!--
      <v-card-actions>
        <v-btn
          v-if="modeis('add')"
          text="Add"
          @click="handleForm('POST')"
          :disabled="!isFormValid"
        />
        <v-btn
          v-if="modeis('update')"
          text="Update"
          @click="handleForm('PUT')"
          :disabled="!isFormValid"
        />
        <v-btn text="Close" @click="closeDialog" />
      </v-card-actions>
    -->
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { date } from 'quasar'
import { useExpenseStore } from "stores/expense-store";
const storeExpense = useExpenseStore();

const props = defineProps(["selectedTrip", "dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

const expenseForm = ref(null);
const debugme = (e) => {
  console.log(e)
}

const isFormValid = ref(false);
const dialogcategories = ref([]);
const dialogusers = ref([]);
const lexpense = ref({})

// const lexpense = ref({
//   amount: null,
//   currency: "€",
//   // date:  ref(new Date()),
//   location: "",
//   description: "",
// });

// Helper for determining dialog visibility and mode
const ldialog = computed({
  get: () => props.dialog,
  set: (value) => emit("dialog", value),
});

const modeis = (e) => props.mode === e;

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

// currencies seed =>
// it would make sense to transfer this table to the database.
const currencies = [
  { name: "USD", symbol: "$", factor: 0.92 },
  { name: "EUR", symbol: "€", factor: 1.0 }, // Bezugswährung
];

// Fetch Data on Mount
onMounted(async () => {
  await storeExpense.postTripUsers(props.selectedTrip.id);
  dialogusers.value = storeExpense.users;

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
      resetForm();
      break;
    case "update":
      lexpense.value = {
        // ...lexpense.value,
        id: props.item.id,
        amount: props.item.amount,
        currency: props.item.currency,
        date: date.formatDate(new Date(props.item.date),'DD.MM.YYYY'),
        location: props.item.location,
        // categoryId: props.item.categoryId,
        description: props.item.description,
        tripId: props.item.tripId,
        user: props.item.user,
        userId: props.item.userId,
      };
      break;
  }
});

const handleForm = async (method) => {
  if (!isFormValid.value) return;

  let rec = {};
  if (method === "POST") {
    rec = {
      amount: parseFloat(lexpense.value.amount),
      date: new Date(lexpense.value.date),
      location: "",
      currency: lexpense.value.currency,
      description: lexpense.value.description,
      trip: { connect: { id: props.selectedTrip.id } },
      user: { connect: { id: lexpense.value.userId } },
      category: { connect: { id: lexpense.value.categoryId } },
    };
  }

  if (method === "PUT") {
    rec = {
      ...lexpense.value,
      amount: parseFloat(lexpense.value.amount),
    };
  }

  // Send data to API
  try {
    await storeExpense.requestExpenses(method, rec);
    // await $fetch('/api/expenses', {
    //     method,
    //     body: rec,
    // })
    // Reset the form
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
