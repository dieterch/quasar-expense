<template>
  <!--q-page class="flex flex-start"-->
  <q-page>

    <div class="col-12">
        <StatisticsDialog
          :data="statistics"
          v-model:showDialog="showStatistics"
        />
    </div>

    <div class="row">
      <div class="col-12">
        <q-table
          dense
          flat
          class="transparent-bg-table"
          :rows="expenses"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :sort-method="customSort"
          :pagination="initialPagination"
        >

          <template v-slot:top>
            <div v-if="statistics" @click="showStatistics = true">
              <q-chip size="sm" color="primary" icon="functions" square class="q-ml-none">{{ statistics.total.toFixed(0) }} €</q-chip>
              <q-chip size="sm" color="primary" icon="event" square>{{ statistics.avg.toFixed(0) }} €</q-chip>
              <q-chip size="sm" color="primary" icon="date_range" square>{{ statistics.totalDays }} days</q-chip>
            </div>
          </template>

          <template v-slot:body-cell-trip="props">
            <q-td :props="props">
              <q-item>
                <!--q-item-section side>
                  <q-icon :name="props.row.categoryIcon" size="xs"></q-icon>
                </q-item-section-->
                <q-item-section>
                  <q-item-label lines="2"><q-icon :name="props.row.categoryIcon" size="xs" class="q-pr-xs"></q-icon>{{ props.row.description }}</q-item-label>
                  <q-item-label caption lines="1">{{
                    props.row.trip
                  }}</q-item-label>
                  <q-item-label caption lines="2"
                    >Payed by {{ props.row.user }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-td>
          </template>

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
                <q-btn
                  round
                  icon="delete"
                  size="sm"
                  class="bg-tertiary"
                  @click="deleteExpense(props.row)"
                />
              </div>
            </q-td>
          </template>

          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="100%"> Bottom Row </q-td>
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

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab
        icon="keyboard_arrow_up"
        direction="up"
        color="accent"
        padding="10px"
      >
        <q-fab-action @click="exportExpenses" color="primary" icon="mdi-file-excel" />
        <q-fab-action
          @click="debug = !debug"
          color="primary"
          icon="bug_report"
        />
        <q-fab-action @click="reload" color="primary" icon="refresh" />
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
import { saveToExcel, parseDateToIso, htmlDialogContent } from 'src/utils/helpers';
import { useExpenseStore } from "stores/expense-store";
import StatisticsDialog from "components/StatisticsDialog.vue";
import { storeToRefs } from "pinia";

const expenseStore = useExpenseStore();
const $q = useQuasar();

const expenses = ref([]);
const showStatistics = ref(false);
const statistics = ref(null);
const columns = ref([]);
const debug = ref(false);

const reload = async() => {
  await expenseStore.getExpenses();
  expenses.value = expenseStore.expensesRows;
  columns.value = expenseStore.allexpansesColumns;
  statistics.value = expenseStore.statisticsExpense();
}

onMounted(async () => {
  await reload()
});

const initialPagination = {
  sortBy: "date",
  descending: true,
  page: 1,
  rowsPerPage: 8,
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
    title: "Delete",
    message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
    html: true,
  });
  console.log(item);
};

// const refresh = () => {
//   expenseStore.fetchExpenses();
// };

const exportExpenses = async() => {
  // exportTable( expenseStore.expensesRows, expenseStore.allexpansesColumns)
  await saveToExcel(expenseStore.expenses, 'allexpenses')
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
