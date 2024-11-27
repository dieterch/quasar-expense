<template>
  <q-page>
    <div class="row">
      <div class="col-12">
        <q-table
          :title="selectedTrip"
          dense
          flat
          :rows="tripsRows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :sort-method="customSort"
          :pagination="initialPagination"
          hide-pagination
          @row-click="rowclick"
          >
          <template v-slot:top>

          <div style="margin: 20px 0px 15px 13px;">
            <div v-if="selectedTrip">
              <b>Selected Trip: </b><span class="selected-trip">{{ selectedTrip.name }}</span>
            </div>
            <div v-else>
              <b>Selected Trip: </b><span class="selected-trip">-</span>
            </div>
          </div>

          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-md">
                <q-btn round icon="delete" size="sm" class="bg-indigo-2" @click="deleteExpense(props.row)" />
                <q-btn round icon="edit_note" class="bg-indigo-2" size="sm" @click="editExpense(props.row)" />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <div v-if="debug">
      <h4>TripRows:</h4>
      <pre>{{ storeExpense.tripsRows }}</pre>
      <h4>Trips:</h4>
      <pre>{{ storeExpense.trips }}</pre>
    </div>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-fab icon="add_circle" direction="up" color="indigo" class="bg-indigo-2" style="opacity: 70%;" flat padding="8px">
        <q-fab-action @click="onClick" color="indigo" icon="mdi-file-excel" />
        <q-fab-action @click="debug = !debug" color="indigo" icon="bug_report"/>
        <q-fab-action @click="refresh" color="indigo" icon="refresh" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "AllExpensesPage",
});

import { ref, onMounted, reactive, watch } from "vue";
// import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from 'vue-router'
import { useExpenseStore } from 'stores/expense-store';
import { storeToRefs } from 'pinia';
const storeExpense = useExpenseStore()

const $q = useQuasar()
const router = useRouter()
const tripsRows = ref([]);
const debug = ref(false);

const selectedTrip = reactive({
  id: 0,
  name: "",
});

const savedData = $q.localStorage.getItem('selectedTrip')
if (savedData) Object.assign(selectedTrip, savedData)

watch(selectedTrip, value => {
  console.log(value)
  $q.localStorage.set('selectedTrip', value)
})

onMounted(async () => {
  await storeExpense.fetchTrips()
  //rows.value = storeExpense.filteredExpensesRows("04e1aa8a-80fa-45e6-ae83-7036de0a401f")
  tripsRows.value = storeExpense.tripsRows
});

const columns = [
  // { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
  {
    name: "date",
    align: "center",
    label: "Start Date",
    field: "date",
    sortable: true,
  },
  { name: "name", align: "left", label: "Trip Name", field: "name", sortable: true },
  {
    name: "participants",
    align: "left",
    label: "Participants",
    field: "participants",
    sortable: true,
  },
  {
    name: "noexpenses",
    align: "left",
    label: "Expenses",
    field: "noExpenses",
    sortable: true,
  },
  { name: "actions", align: "right", label: "Actions" },
];

const initialPagination = {
  sortBy: "date",
  descending: true,
  page: 1,
  rowsPerPage: 20,
  // rowsNumber: xx if getting data from a server
};

const customSort = (rows, sortBy, descending) => {
  const data = [...rows];

  if (sortBy) {
    data.sort((a, b) => {
      const x = descending ? b : a;
      const y = descending ? a : b;

      if (sortBy === "date") {
        // Date sort
        return new Date(x["rawdate"]) > new Date(y["rawdate"])
          ? 1
          : new Date(x["rawdate"]) < new Date(y["rawdate"])
            ? -1
            : 0;
      } else if (sortBy === "expense") {
        return parseFloat(x["amount"]) - parseFloat(y["amount"]);
      } else {
        // string sort
        return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0;
      }
    });
  }
  return data;
};

const deleteExpense = (item) => {
  $q.dialog({
        title: 'Delete',
        message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
        html: true
      })
  console.log(item);
};

const editExpense = (item) => {
  $q.dialog({
        title: 'Edit',
        message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
        html: true
      })
  console.log(item);
};

const refresh = () => {
  storeExpense.fetchExpenses()
}

const rowclick = (e, row, index) => {
  // $q.dialog({
  //       title: 'Row Click',
  //       message: `<pre>${JSON.stringify({
  //         evt: e,
  //         row: row,
  //         index: index
  //       }, null, 2)}</pre>`,
  //       html: true
  //     })
  selectedTrip.name = row.name
  selectedTrip.id = row.id
  router.push('/')
}

</script>

<style>
.my-table-details {
  font-size: 0.85em;
  font-style: italic;
  max-width: 50px;
  white-space: normal;
  color: #555;
  margin-top: 4px;
}

.selected-trip {
  background-color: rgb(207, 207, 207);
  margin-left: 10px;
  padding: 8px;
}
</style>
