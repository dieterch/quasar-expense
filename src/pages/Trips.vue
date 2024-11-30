<template>
  <q-page>
    <div class="row">
      <div class="col-12">
        <TripsDialog
            :dialog="isDialogOpen"
            :key="isDialogOpen"
            :mode="mode"
            :item="eitem"
            @refresh="reload"
            @dialog="(e)=>{isDialogOpen = e}"
        />
      </div>
    </div>

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
          bordered
          :sort-method="customSort"
          :pagination="initialPagination"
          hide-pagination
          @row-click="rowclick"
        >
          <template v-slot:top>
            <SelectedTripBadge :selectedTrip="selectedTrip" @click="goToExpense"/>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ props.row.name }}</q-item-label>
                  <q-item-label caption lines="2">{{
                    props.row.participants
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-md">
                <q-btn
                  round
                  icon="delete"
                  size="sm"
                  class="bg-primary-2"
                  @click.stop="deleteTrip(props.row)"
                />
                <q-btn
                  round
                  icon="edit_note"
                  class="bg-primary-2"
                  size="sm"
                  @click.stop="editTrip(props.row)"
                />
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

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab icon="keyboard_arrow_up" direction="up" color="accent" padding="10px">
        <q-fab-action @click="onClick" color="primary" icon="mdi-file-excel" />
        <q-fab-action
          @click="debug = !debug"
          color="primary"
          icon="bug_report"
        />
        <q-fab-action @click="refresh" color="primary" icon="refresh" />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "TripsPage",
});

import { ref, onMounted, reactive, watch } from "vue";
// import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

import { useTripStore } from "stores/trip-store";
const tripStore = useTripStore();

import TripsDialog from "components/TripsDialog.vue";
import SelectedTripBadge from "components/SelectedTripBadge.vue";

const isDialogOpen = ref(false)
const mode = ref('')
const eitem = ref({})
const $q = useQuasar();
const router = useRouter();
const tripsRows = ref([]);
const columns = ref([])
const debug = ref(false);

const selectedTrip = reactive({
  id: 0,
  name: "",
});

// update Localstorage
watch(selectedTrip, (value) => {
  console.log(value);
  $q.localStorage.set("selectedTrip", value);
});

// reload from database
const reload = async() => {
  const localdata = $q.localStorage.getItem('selectedTrip')
  if (localdata) Object.assign(selectedTrip, localdata)
  await tripStore.getTrips()
  tripsRows.value = tripStore.tripsRows;
  columns.value = tripStore.alltripsColumns
}

onMounted(async () => {
  await reload()
});

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
        return new Date(x["rawdate"]) > new Date(y["rawdate"]) ? 1 : new Date(x["rawdate"]) < new Date(y["rawdate"]) ? -1 : 0;
      } else if (sortBy === "noExpenses") {
        return parseFloat(x[sortBy]) - parseFloat(y[sortBy]);
      } else {
        // string sort
        return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0;
      }
    });
  }
  return data;
};

const deleteTrip = (item) => {
  $q.dialog({
    title: "Delete",
    message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
    html: true,
  });
  console.log(item);
};

const editTrip = (item) => {
  // $q.dialog({
  //   title: "Edit",
  //   message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
  //   html: true,
  // });
  console.log(JSON.stringify(item, null, 2));
  openTripDialog('update',item)
};

 // Open Trip Dialog, add or update database row
 const openTripDialog = (pmode, pitem) => {
    // $q.dialog({
    //     title: 'Update',
    //     message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
    //     html: true
    //   })
    mode.value = pmode
    eitem.value = pitem
    isDialogOpen.value = true
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
  selectedTrip.name = row.name;
  selectedTrip.id = row.id;
  router.push("/");
};

const goToExpense = () => {
  router.push("/");
};
</script>
