<template>
  <!--q-page class="flex flex-start"-->
  <q-page>
    <div class="row">
      <div class="col-12">
        <q-table
          title="All Expenses"
          dense
          :rows="rows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :sort-method="customSort"
          :pagination="initialPagination"
          >
          <template v-slot:body-cell-category="props">
            <q-td :props="props">
              <div class="row">
                <div>
                  <q-icon :name="props.row.categoryIcon" size="xs"></q-icon>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-md">
                <q-btn round icon="delete" size="sm" class="bg-indigo-2" @click="deleteExpense(props.row)" />
              </div>
            </q-td>
          </template>

          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="100%">
                Bottom Row
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <div v-if="debug">
      <h4>Rows:</h4>
      <pre>{{ rows }}</pre>
      <h4>Expenses:</h4>
      <pre>{{ expenses }}</pre>
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

import { ref, onMounted } from "vue";
// import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useExpenseStore } from 'stores/expense-store';
import { storeToRefs } from 'pinia';
const storeExpense = useExpenseStore()

const $q = useQuasar()
// const expenses = ref([])
const rows = ref([]);
const debug = ref(false);

onMounted(async () => {
  await storeExpense.fetchExpenses()
  //rows.value = storeExpense.filteredExpensesRows("04e1aa8a-80fa-45e6-ae83-7036de0a401f")
  rows.value = storeExpense.expensesRows
});

const columns = [
  // { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
  {
    name: "date",
    align: "center",
    label: "Date",
    field: "date",
    sortable: true,
  },
  { name: "trip", align: "left", label: "Trip", field: "trip", sortable: true },
  {
    name: "category",
    align: "left",
    label: "Cat",
    field: "category",
    sortable: true,
  },
  {
    name: "description",
    align: "left",
    label: "Description",
    field: "description",
    sortable: true,
  },
  {
    name: "expense",
    align: "right",
    label: "Expense",
    field: "amount",
    format: (val) => `${val} €`,
    sortable: true,
  },
  { name: "user", align: "left", label: "User", field: "user", sortable: true },
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

const refresh = () => {
  storeExpense.fetchExpenses()
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
</style>
