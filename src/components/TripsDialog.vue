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
              v-model="formTrip.name"
              label="Trip Nam*"
              lazy-rules
              :rules="[(v) => !!v || 'Description is required']"
              @blur="validate"
            />
          </div>
        </div>
        <div class="row">
          <div class="col q-ml-md q-mr-md">
            <q-table
              dense
              flat
              :rows="users"
              :columns="columns"
              row-key="name"
              separator="horizontal"
              bordered
              hide-pagination
              selection="multiple"
              v-model:selected="selected"
              @blur="validate"
            />
        </div>

          <!--div class="col q-ml-md">
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
          </div-->
        </div>
        <div class="row">
          <div class="col q-ml-md q-mr-md" style="max-width: 300px">
            <q-input
              filled
              dense
              v-model="formTrip.date"
              label="Start Date"
              :rules="[(v) => !!v || 'Date is required']"
              @blur="validate"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="formTrip.date"
                      mask="DD.MM.YYYY"
                      title="Trip Start Date"
                      :subtitle="formTrip.date"
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
        <pre>{{ selected }}</pre>
        <!--pre>{{ users }}</pre-->
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { date } from 'quasar'
const { formatDate } = date
import { useTripStore } from "stores/trip-store";
import { useUserStore } from "stores/user-store";
const tripStore = useTripStore();
const userStore = useUserStore();

const props = defineProps(["dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

// Dropdown data
const trips = ref([])
const users = ref([]);
const columns = ref([]);
const selected = ref([]) // Keep track of selected users

// Form reference
const tripForm = ref(null);

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

// State for the trip data
const formTrip = ref({})

const validate = async () => {
  console.log('in validate')
  isFormValid.value = await tripForm.value.validate();
}

// // Reset Form
// const resetForm = () => {
//   formTrip.value = { name: '', startDate: null, users: {} }
//   selected.value = []
// };

// Fetch Data on Mount
onMounted(async () => {
  await tripStore.getTrips();
  users.value = tripStore.trips;

  await userStore.getUsers();
  users.value = userStore.usersRows;
  columns.value = userStore.tripDialogUsersColumns

  switch (props.mode) {
    case "add":
      onReset();
      //resetForm();
      break;
    case "update":
      formTrip.value = {
        // ...lexpense.value,
        id: props.item.id,
        name: props.item.name,
        startDate: formatDate(new Date(props.item.startDate),'DD.MM.YYYY'),
      };
      //selected.value = props.item.users.map((rec) => rec.user )
      break;
  }
});

// Form submission handler
const onSubmit = async () => {
  if (isFormValid.value) {
    console.log('Form is valid:', fo.value);
    // Perform your submit logic here
    await handleForm(modeis('add') ? 'POST':'PUT')
  } else {
    console.log('Form is invalid.');
  }
};

// Reset form
const onReset = () => {
  formTrip.value = {
    name: '',
    startDate: formatDate(new Date(),'DD.MM.YYYY'),
    users: []
  };
  selected.value = []
  if (tripForm.value) {
    tripForm.value.resetValidation();
  }
  isFormValid.value = false;
};

const parseDateToIso = ( datestring ) => {
  const [day, month, year ] = datestring.split('.').map(Number)
  const retval =  new Date(Date.UTC(year, month-1, day)).toISOString()
  return retval
}

/////////////////////////////////////////
const handleForm = async (method) => {
  if (!isFormValid.value || selected.value.length === 0) return;

  // Prepare users for submission
  const userArray = selected.value.map(user => ({ userId: user.id }))
  const payload = {
      ...formTrip.value,
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



