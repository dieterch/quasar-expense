<template>
  <q-dialog
    v-model="ldialog"
    @show="validate"
  >
    <q-card class="q-pa-md" style="width: 480px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">
          {{ modeis("add") ? "Add User" : "Update User" }}
        </div>
      </q-card-section>
      <q-form
        ref="userForm"
        class="q-gutter-md"
        @submit.prevent="onSubmit"
      >
        <div class="row">
          <div class="col q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.name"
              label="User Name*"
              lazy-rules
              :rules="[(v) => !!v || 'Name is required']"
              @blur="validate"
            />
          </div>
          <div class="col-4 q-ml-md q-mr-md">
              <q-select
                  v-model="formdata.role"
                  dense
                  label="Role"
                  :options="[ 'admin', 'user']"
                  nooption-label="role"
                  nooption-value="id"
                  filled
                  :rules="[(v) => !!v || 'required']"
                  @blur="validate"
                />
          </div>
        </div>
        <div class="row">
          <div class="col-12 q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.email"
              label="User Email*"
              lazy-rules
              :rules="[(v) => !!v || 'Email is required']"
              @blur="validate"
            />
          </div>
          <div class="col-12 q-ml-md q-mr-md">
            <q-input
              filled
              dense
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              v-model="formdata.password"
              label="User Password*"
              :type="showPassword ? 'text' : 'password'"
              lazy-rules
              @click:append="showPassword = !showPassword"
            />
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
        <small v-if="true">
          Formdata:
          <pre>{{ formdata }}</pre>
          Props.item:
          <pre>{{ props.item }}</pre>
          Users:
          <pre>{{ users }}</pre>
      </small>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import { hashSync }from 'bcryptjs' // for frontend
import { date } from 'quasar';
const { formatDate } = date;
import { parseDateToIso, htmlDialogContent } from 'src/utils/helpers';
import { useExpenseStore } from "stores/expense-store";
import { useTripStore } from "stores/trip-store";
import { useUserStore } from "stores/user-store";
const expenseStore = useExpenseStore();
const showPassword = ref(false)
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
const userForm = ref(null);
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
  isFormValid.value = await userForm.value.validate();
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
        email: props.item.email,
        role: props.item.role
      };
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
    email: '',
    password: '',
    role: 'user'
  };
  selected.value = []
  if (userForm.value) {
    userForm.value.resetValidation();
  }
  isFormValid.value = false;
};

/////////////////////////////////////////
const handleForm = async (method) => {

  // Ensure the form is valid and at least one user is selected
  if (!isFormValid.value) return

  if ( modeis('add') ) {
    if ( formdata.password === "" ) {
      $q.dialog({
        title: "Password",
        message: 'password cannot be empty in add mode',
      });
      return
    }
  }

  let payload = { ...formdata.value }

  if (( 'password' in formdata.value) && (formdata.value.password != '')) {
            payload.password = hashSync(formdata.value.password, 10)
  } else console.log('Password not changed.')

  console.log('method:',method)
  console.log('payload:',JSON.stringify(payload, null,2))
  // Send data to API
  try {
    await userStore.requestUsers(method, payload);
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



