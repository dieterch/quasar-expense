<template>
  <!--q-page class="flex flex-start"-->
  <q-page>
    <div class="row">
      <div class="col-12">
        <ExpensesDialog
            :dialog="isDialogOpen"
            :key="isDialogOpen"
            :mode="mode"
            :item="eitem"
            :selectedTrip="selectedTrip"
            @refresh="reload"
            @dialog="(e)=>{isDialogOpen = e}"
        />
      </div>

      <div class="col-12">
        <StatisticsDialog
          :data="statistics"
          v-model:showDialog="showStatistics"
        />
      </div>

    </div>

    <div class="row">
      <div class="col-12">
        <q-table
          title="Trip Expenses"
          dense
          flat
          class="transparent-bg-table"
          :rows="filteredexpenses"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          :sort-method="customSort"
          :pagination="initialPagination"
          hide-pagination
          hide-no-data
          @row-click="rowclick"
          >
          <template v-slot:top>
            <SelectedTripBadge :selectedTrip="selectedTrip" @click="router.push('/trips')" class="q-mr-sm"/>
            <div v-if="statistics" @click="showStatistics = true">
              <q-chip size="sm" color="primary" icon="functions" square class="q-ml-none">{{ statistics.total.toFixed(0) }} €</q-chip>
              <q-chip size="sm" color="primary" icon="event" square>{{ statistics.avg.toFixed(0) }} €</q-chip>
              <q-chip size="sm" color="primary" icon="date_range" square>{{ statistics.totalDays }} days</q-chip>
            </div>
          </template>

          <template v-slot:header-cell-description="props">
            <q-th :props="props" class="text-center">
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:body-cell-description="props">
            <q-td :props="props">
              <q-item>
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
                <q-btn round icon="delete" size="sm" class="bg-primary-2" @click.stop="deleteExpense(props.row)" />
                <q-btn round icon="edit_note" class="bg-primary-2" size="sm" @click="openExpenseDialog('update',props.row)" />
              </div>
            </q-td>
          </template>

        </q-table>
      </div>
    </div>
    <div v-if="debug">
    <small>
        Statistics:
        <pre>{{ statistics }}</pre>
        Rows:
        <pre>{{ expenseStore.expensesRows }}</pre>
        Expenses:
        <pre>{{ expenseStore.expenses }}</pre>
    </small>
    </div>

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab icon="keyboard_arrow_up" direction="up" color="accent" padding="10px">
        <q-fab-action @click="openExpenseDialog('add', {})" color="primary" icon="add" />
        <q-fab-action @click="exportExpenses" color="primary" icon="mdi-file-excel" />
        <q-fab-action @click="debug = !debug" color="primary" icon="bug_report"/>
        <q-fab-action @click="calcStatistics" color="primary" icon="analytics"/>
        <q-fab-action @click="reload" color="primary" icon="refresh" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "ExpensesPage",
});

import { ref, onMounted, reactive } from "vue";
import { useRouter } from 'vue-router'
import { useQuasar } from "quasar";
import { exportTable, saveToExcel, parseDateToIso, htmlDialogContent } from 'src/utils/helpers';
import { useExpenseStore } from 'stores/expense-store';
const expenseStore = useExpenseStore()

import ExpensesDialog from 'components/ExpensesDialog.vue'
import SelectedTripBadge from "components/SelectedTripBadge.vue";
import StatisticsDialog from "components/StatisticsDialog.vue";

const isDialogOpen = ref(false)
const showStatistics = ref(false);
const mode = ref('')
const eitem = ref({})
const $q = useQuasar()
const router = useRouter()

const filteredexpenses = ref([]);
const columns = ref([]);
const statistics = ref(null);
const debug = ref(false);

const selectedTrip = reactive({
  id: 0,
  name: "",
});

const reload = async() => {
  const localdata = $q.localStorage.getItem('selectedTrip')
  if (localdata) Object.assign(selectedTrip, localdata)
  await expenseStore.postTripExpenses(localdata.id)
  filteredexpenses.value = expenseStore.expensesRows
  columns.value = expenseStore.tripexpensesColumns
  statistics.value = expenseStore.statisticsExpense();
}

onMounted(async () => {
  await reload()
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

  // Open Expenses Dialog, add or update database row
  const openExpenseDialog = (pmode, pitem) => {
    // $q.dialog({
    //     title: 'Update',
    //     message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
    //     html: true
    //   })
    mode.value = pmode
    eitem.value = pitem
    isDialogOpen.value = true
  }

  const calcStatistics = () => {
    statistics.value = expenseStore.statisticsExpense();
    showStatistics.value = true
    // console.log(statistics.value)
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
        // console.log(e,row,index)
        mode.value = 'update'
        eitem.value = row
        isDialogOpen.value = true
      };

  // const htmlcontent = ( item ) =>  {
  //     return `<i class="mdi ${item.categoryIcon}" style="font-size: 2.5em;"></i>` +
  //      `  <span style="font-size: 1.6em;">${item.description}</span><br>` +
  //      `  <span style="font-size: 1.2em; margin-left: 8px;">${item.amount} ${item.currency}</span><br>`+
  //      `  <span style="font-size: 0.8em; margin-left: 9px;">Payed by ${item.user}</span>`
  // }

  // const h = ( item ) => htmlDialogContent( 'mdi-alert-outline', 'orange', `${item.description} - ${item.amount}${item.currency} payed by ${item.user}` )

  const deleteExpense = (item) => {
    $q.dialog({
      title: 'Delete ?',
      //message: `Delete "${item.description}". Continue?`,
      cancel: true,
      message: htmlDialogContent(
        'mdi-alert-outline', 'orange',
        `${item.description}<br>${item.amount}${item.currency} <br><small>payed by ${item.user}<small>` ),
      // message: htmlcontent(item),
      html: true
    }).onOk(async() => {
        console.log('DELETE:')
        console.log(JSON.stringify(item, null,2))
        await expenseStore.deleteExpense(item.id)
        reload()
    }).onCancel(() => {
      console.log('you pressed cancel.')
    })
  };

  const exportExpenses = async() => {
    // exportTable( expenseStore.expensesRows, expenseStore.allexpansesColumns)
    await saveToExcel(expenseStore.expenses, selectedTrip.name)
  }

</script>

