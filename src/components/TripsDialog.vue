<template>
  <q-dialog
    v-model="ldialog"
    @show="validate"
  >
    <q-card class="q-pa-md" style="width: 480px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          {{ modeis("add") ? "Add Trip" : "Update Trip" }}
        </div>
      </q-card-section>
      <q-form
        ref="tripForm"
        class="q-gutter-md"
        @submit.prevent="onSubmit"
      >
        <div class="row">
          <div class="col q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.name"
              label="Trip Name*"
              lazy-rules
              :rules="[(v) => !!v || 'Description is required']"
              @blur="validate"
            />
          </div>
        </div>
        <div class="row">
          <div class="col q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.date"
              label="Start Date"
              :rules="[(v) => !!v || 'Date is required']"
              @blur="validate"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formdata.date"
                      mask="DD.MM.YYYY"
                      title="Trip Start Date"
                      :subtitle="formdata.date"
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
        <div class="col q-ml-md q-mr-md">
            <q-table
              dense
              flat
              :rows="users"
              :columns="columns"
              row-key="name"
              separator="none"
              nobordered
              :pagination="initialPagination"
              hide-pagination
              hide-header
              selection="multiple"
              v-model:selected="selected"
              @blur="validate"
            />
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
        <small v-if="true">
          tripexpenses:
          <pre>{{ tripexpenses }}</pre>
          Formdata:
          <pre>{{ formdata }}</pre>
          Selected:
          <pre>{{ selected }}</pre>
          Props.item:
          <pre>{{ props.item }}</pre>
          Available Users:
          <pre>{{ users }}</pre>
      </small>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { date } from 'quasar';
const { formatDate } = date;
import { parseDateToIso, htmlDialogContent } from 'src/utils/helpers';
import { useExpenseStore } from "stores/expense-store";
import { useTripStore } from "stores/trip-store";
import { useUserStore } from "stores/user-store";
const expenseStore = useExpenseStore();
const tripStore = useTripStore();
const userStore = useUserStore();
const $q = useQuasar();

const props = defineProps(["dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

const tripexpenses = ref([])
const users = ref([]);

// Dropdown data
const columns = ref([]);
const selected = ref([]) // Keep track of selected users

const initialPagination = {
  sortBy: "name",
  descending: true,
  page: 1,
  rowsPerPage: 0,
  // rowsNumber: xx if getting data from a server
};

// Form reference
const tripForm = ref(null);
// State for the trip data
const formdata = ref({})

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


const validate = async () => {
  console.log('in validate')
  isFormValid.value = await tripForm.value.validate();
}

// Fetch Data on Mount
onMounted(async () => {
  await expenseStore.postTripExpenses(props.item.id);
  tripexpenses.value = expenseStore.expenses;

  await userStore.getUsers();
  users.value = userStore.usersRows;
  columns.value = userStore.tripDialogUsersColumns

  switch (props.mode) {
    case "add":
      onReset();
      //resetForm();
      break;
    case "update":
      formdata.value = {
        // ...lexpense.value,
        id: props.item.id,
        name: props.item.name,
        date: formatDate(new Date(props.item.date),'DD.MM.YYYY'),
      };
      selected.value = props.item.participants.split(', ').map((name) => {
        return users.value.find((rec) => rec.name === name)
      })
      break;
  }
});

// Form submission handler
const onSubmit = async () => {
  if (isFormValid.value) {
    console.log('Form is valid:', formdata.value);
    // Perform your submit logic here
    await handleForm(modeis('add') ? 'POST':'PUT')
  } else {
    console.log('Form is invalid.');
  }
};

// Reset form
const onReset = () => {
  formdata.value = {
    name: '',
    date: formatDate(new Date(),'DD.MM.YYYY'),
    users: []
  };
  selected.value = []
  if (tripForm.value) {
    tripForm.value.resetValidation();
  }
  isFormValid.value = false;
};

/////////////////////////////////////////
const handleForm = async (method) => {

  // Ensure the form is valid and at least one user is selected
  if (!isFormValid.value || selected.value.length === 0) {

    $q.dialog({
      title: 'Select Trip Users',
      message: htmlDialogContent('mdi-alert-circle-outline', 'red', 'At least one participant must be selected!'),
      html:true,
      //message: 'At least one participant must be selected.',
    })
    closeDialog();
    return;
  };

  // If in update mode, ensure all trip-related expenses have a valid owner
  if (method === 'PUT' && tripexpenses.value.some(expense =>
      !selected.value.some(user => user.id === expense.userId)
  )) {
      // alert('TripUsers with expenses cannot be deleted!');
      $q.dialog({
        title: 'Error',
        message: htmlDialogContent('mdi-alert-circle-outline', 'red', 'Users with active expenses may not be disconnected!'),
        html:true,
        // message: 'users with expenses cannot be disconnected!'
      })
      closeDialog();
      return;
  }

  // Prepare users for submission
  const userArray = selected.value.map(user => ({ userId: user.id }))
  const payload = {
      // ...formdata.value,
      name: formdata.value.name,
      startDate: parseDateToIso(formdata.value.date),
      users: (method === 'POST') ? { create: userArray } : userArray
  }
  if (method === 'PUT') { payload.id = props.item.id }

  // let payload = {};
  // if (method === "POST") {
  //   payload = {
  //     id: lexpense.value.id,
  //     amount: parseFloat(lexpense.value.amount),
  //     date: parseDateToIso(lexpense.value.date),
  //     location: "",
  //     currency: lexpense.value.currency,
  //     description: lexpense.value.description,
  //     trip: { connect: { id: props.selectedTrip.id } },
  //     user: { connect: { id: lexpense.value.user.id } },
  //     category: { connect: { id: lexpense.value.category.id } },
  //   };
  // }

  // if (method === "PUT") {
  //   payload = {
  //     id: lexpense.value.id,
  //     amount: parseFloat(lexpense.value.amount),
  //     date: parseDateToIso(lexpense.value.date),
  //     location: "",
  //     currency: lexpense.value.currency,
  //     description: lexpense.value.description,
  //     trip: { connect: { id: props.selectedTrip.id } },
  //     user: { connect: { id: lexpense.value.user.id } },
  //     category: { connect: { id: lexpense.value.category.id } },
  //   };
  // }

  console.log('method:',method)
  console.log('payload:',JSON.stringify(payload, null,2))
  // Send data to API
  try {
    await tripStore.requestTrips(method, payload);
    // resetForm();
    onReset()
    emit("refresh");
    closeDialog();
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(error);
  }
};

// Close Dialog without Submission of data
const closeDialog = () => {
  //resetForm();
  onReset()
  emit("dialog", false);
};
</script>

<style scoped>
::v-deep(.q-field.q-field--error .q-field__append .q-icon.text-negative) {
  display: none !important;
}
</style>



