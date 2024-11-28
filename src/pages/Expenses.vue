<template>
  <!--q-page class="flex flex-start"-->
  <q-page>
    <div class="row">
      <div class="col-12">
        <q-table
          title="Trip Expenses"
          dense
          flat
          :rows="filteredexpenses"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :sort-method="customSort"
          :pagination="initialPagination"
          bordered
          nothide-pagination
          >
          <template v-slot:top>
            <div style="margin: 20px 0px 15px 13px;" @click="router.push('/trips')">
              <div v-if="selectedTrip">
            <b>Selected Trip: </b><span class="selected-trip">{{ selectedTrip.name }}</span>
              </div>
              <div v-else>
                <b>Selected Trip: </b><span class="selected-trip">-</span>
              </div>
            </div>
          </template>

          <template v-slot:body-cell-description="props">
            <q-td :props="props">
              <q-item>
                <!--q-item-section side>
                      <q-icon :name="props.row.categoryIcon" size="xs"></q-icon>
                </q-item-section-->
                <q-item-section>
                  <q-item-label lines="2"><q-icon :name="props.row.categoryIcon" size="xs" class="q-pr-xs"></q-icon>{{ props.row.description }}</q-item-label>
                  <q-item-label caption lines="2">Payed by {{ props.row.user }}</q-item-label>

                </q-item-section>
              </q-item>
            </q-td>
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
      <h4>Rows:</h4>
      <pre>{{ storeExpense.expensesRows }}</pre>
      <h4>Expenses:</h4>
      <pre>{{ storeExpense.expenses }}</pre>
    </div>

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab icon="add_circle" direction="up" color="indigo" class="bg-indigo-2" style="opacity: 70%;" flat padding="10px">
        <q-fab-action @click="onClick" color="indigo" icon="add" />
        <q-fab-action @click="onClick" color="indigo" icon="mdi-file-excel" />
        <q-fab-action @click="debug = !debug" color="indigo" icon="bug_report"/>
        <q-fab-action @click="onClick" color="indigo" icon="refresh" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "ExpensesPage",
});

import { ref, onMounted, reactive } from "vue";
// import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from 'vue-router'
import { useExpenseStore } from 'stores/expense-store';
import { storeToRefs } from 'pinia';

const storeExpense = useExpenseStore()
const $q = useQuasar()
const router = useRouter()

const filteredexpenses = ref([]);
const columns = ref([])
const debug = ref(false);

const selectedTrip = reactive({
  id: 0,
  name: "",
});

onMounted(async () => {
  const localdata = $q.localStorage.getItem('selectedTrip')
  if (localdata) Object.assign(selectedTrip, localdata)
  await storeExpense.fetchfilteredexpenses(localdata.id)
  filteredexpenses.value = storeExpense.expensesRows
  columns.value = storeExpense.tripexpensesColumns
});

const initialPagination = {
  sortBy: "date",
  descending: true,
  page: 1,
  rowsPerPage: 10,
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
