<template>
  <q-dialog
    v-model="ldialog"
    @show="validate"
  >
    <q-card class="q-pa-md" style="width: 480px; max-width: 80vw">

      <q-form
      ref="categoryForm"
      class="q-gutter-md"
      @submit.prevent="onSubmit"
      >
      <q-card-section>
        <q-item-label lines="2"><q-icon :name="formdata.icon" size="md" class="q-pr-xs"></q-icon>
        <span class="text-h6">
          {{ modeis("add") ? "Add Category" : "Update Category" }}
        </span></q-item-label>
      </q-card-section>
        <div class="row dense">
          <div class="col-10 q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.name"
              label="Category Name*"
              lazy-rules
              :rules="[(v) => !!v || 'Name is required']"
              @blur="validate"
            />
          </div>
          <div class="col-10 q-ml-md q-mr-md">
            <q-input
              filled
              dense
              v-model="formdata.icon"
              label="Category Icon*"
              lazy-rules
              :rules="[(v) => !!v || 'Icon is required']"
              @blur="validate"
            />
          </div>
          <div class="q-ml-md">
              <a href="https://pictogrammers.com/library/mdi/" target="_blank" rel="noopener noreferrer">
                <small>open link: mdi-icons</small>
              </a>
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
        <small v-if="false">
          Formdata:
          <pre>{{ formdata }}</pre>
          Props.item:
          <pre>{{ props.item }}</pre>
          Categories:
          <pre>{{ categories }}</pre>
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
import { useCategoryStore } from "stores/category-store";
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const $q = useQuasar();

const props = defineProps(["dialog", "mode", "item"]);
const emit = defineEmits(["refresh", "dialog"]);

const categories = ref([]);

// Dropdown data
// const columns = ref([]);

const initialPagination = {
  sortBy: "name",
  descending: true,
  page: 1,
  rowsPerPage: 0,
  // rowsNumber: xx if getting data from a server
};

// Form reference
const categoryForm = ref(null);
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
  isFormValid.value = await categoryForm.value.validate();
}

// Fetch Data on Mount
onMounted(async () => {

  await categoryStore.getCategories();
  categories.value = categoryStore.categories;
  //columns.value = userStore.tripDialogUsersColumns

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
        icon: props.item.icon,
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
    icon: '',
  };
  isFormValid.value = false;
};

/////////////////////////////////////////
const handleForm = async (method) => {

  // Ensure the form is valid and at least one user is selected
  if (!isFormValid.value) return

  let payload = { ...formdata.value }

  console.log('method:',method)
  console.log('payload:',JSON.stringify(payload, null,2))
  // Send data to API
  try {
    await categoryStore.requestCategories(method, payload);
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



