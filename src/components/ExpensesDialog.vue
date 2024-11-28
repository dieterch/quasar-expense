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
    <q-card class="q-pa-md" style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          {{ modeis("add") ? "Add Expense" : "Update Expense" }}
        </div>
      </q-card-section>
      <q-form
        ref="expenseForm"
        v-model="isFormValid"
        lazy-validation
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
          <div class="col-3">
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
              label="Select User"
              required
              :rules="[(v) => !!v || 'User is required']"
            />
          </div>

          <div class="col q-ml-md" style="max-width: 300px">
            <q-input
              filled
              dense
              v-model="lexpense.date"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="date">
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
            label="Cancel"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
          />
          <q-btn label="Ok" type="submit" color="primary" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <v-dialog v-model="ldialog" width="500px">
    <v-card>
      <v-card-title>{{
        modeis("add") ? "Add Expense" : "Update Expense"
      }}</v-card-title>
      <v-card-text>
        <pre v-if="false">{{ props.item }}</pre>
        <v-form ref="expenseForm" v-model="isFormValid" lazy-validation>
          <v-row dense>
            <!-- Description Input -->
            <v-col cols="12" md="8" sm="12">
              <v-text-field
                density="compact"
                v-model="lexpense.description"
                label="Title*"
                placeholder="brief description of the expense"
                required
                :rules="[(v) => !!v || 'Description is required']"
              ></v-text-field>
            </v-col>

            <!-- Category Dropdown -->
            <v-col cols="12" md="4" sm="6">
              <v-select
                density="compact"
                v-model="lexpense.categoryId"
                :items="dialogcategories"
                label="Category"
                item-title="name"
                item-value="id"
                required
                :rules="[(v) => !!v || 'required']"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-avatar :icon="item.raw.icon"></v-avatar>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Currency Dropdown -->
            <v-col cols="12" md="3" sm="4">
              <v-select
                density="compact"
                v-model="lexpense.currency"
                :items="currencies"
                item-title="symbol"
                item-value="symbol"
                nolabel="Currency"
                required
                :rules="[(v) => !!v || 'required']"
              ></v-select>
            </v-col>

            <!-- Amount Input -->
            <v-col cols="12" md="9" sm="12">
              <v-text-field
                density="compact"
                v-model="lexpense.amount"
                type="number"
                label="Amount"
                required
                :rules="[(v) => !!v || 'Amount is required']"
              ></v-text-field>
            </v-col>

            <!-- User Dropdown -->
            <v-col cols="12" md="6" sm="12">
              <v-select
                density="compact"
                v-model="lexpense.userId"
                :items="props.selectedTrip.users"
                item-title="user.name"
                item-value="user.id"
                label="Select User"
                required
                :rules="[(v) => !!v || 'User is required']"
              ></v-select>
            </v-col>

            <!-- Date Input -->
            <v-col cols="12" md="6" sm="12">
              <v-date-input
                density="compact"
                v-model="lexpense.date"
                label="Expense Date"
                required
                :rules="[(v) => !!v || 'Date is required']"
              ></v-date-input>
            </v-col>
          </v-row>

          <small class="text-caption text-medium-emphasis"
            >*indicates required field</small
          >
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
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
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useExpenseStore } from "stores/expense-store";
const storeExpense = useExpenseStore();

const props = defineProps(["selectedTrip", "dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

const isFormValid = ref(false);
const dialogcategories = ref([]);
const dialogusers = ref([]);

const lexpense = ref({
  amount: null,
  currency: "€",
  date: new Date(),
  location: "",
  description: "",
});

// Helper for determining dialog visibility and mode
const ldialog = computed({
  get: () => props.dialog,
  set: (value) => emit("dialog", value),
});

const modeis = (e) => props.mode === e;

// Reset Form
const resetForm = async () => {
  lexpense.value = {
    ...lexpense.value,
    amount: null,
    date: new Date(),
    description: "",
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
  await storeExpense.getUsers();
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
        ...lexpense.value,
        id: props.item.id,
        amount: props.item.amount,
        currency: props.item.currency,
        date: new Date(props.item.rawdate),
        location: props.item.location,
        categoryId: props.item.categoryId,
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
