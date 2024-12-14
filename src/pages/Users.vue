<template>
  <q-page>
    <div class="row">
      <div class="col-12">
        <UsersDialog
            :dialog="isDialogOpen"
            :key="isDialogOpen"
            :mode="mode"
            :item="eitem"
            @refresh="reload"
            @dialog="(e)=>{isDialogOpen = e}"
        />
      </div>
    </div>

    <div class="row q-mt-sm">
      <div class="col-12">
        <q-table
          :title="selectedTrip"
          dense
          flat
          :rows="usersRows"
          :columns="columns"
          row-key="id"
          separator="horizontal"
          bordered
          :sort-method="customSort"
          :pagination="initialPagination"
          hide-pagination
          hide-no-data
        >
          <template v-slot:top>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ props.row.name }}</q-item-label>
                  <q-item-label caption lines="2">{{
                    props.row.email
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
                  @click.stop="deleteUser(props.row)"
                />
                <q-btn
                  round
                  icon="edit_note"
                  class="bg-primary-2"
                  size="sm"
                  @click.stop="editUser(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <div v-if="debug">
      <h4>userRows:</h4>
      <pre>{{ userStore.usersRows }}</pre>
    </div>

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab icon="keyboard_arrow_up" direction="up" color="accent" padding="10px">
        <q-fab-action @click="openUserDialog('add', {})" color="primary" icon="add" />
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
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { parseDateToIso, htmlDialogContent } from 'src/utils/helpers';
import { useUserStore } from "stores/user-store";
const userStore = useUserStore();

import UsersDialog from "components/UsersDialog.vue";

const isDialogOpen = ref(false)
const mode = ref('')
const eitem = ref({})
const $q = useQuasar();
const router = useRouter();
const usersRows = ref([]);
const debug = ref(false);
const columns = ref([])

// reload from database
const reload = async() => {
  await userStore.getUsers()
  usersRows.value = userStore.usersRows;
  columns.value = userStore.allUserColumns
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

// const deleteTrip = (item) => {
//   $q.dialog({
//     title: "Delete",
//     message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
//     html: true,
//   });
//   console.log(item);
// };

const editUser = (item) => {
  // $q.dialog({
  //   title: "Edit",
  //   message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
  //   html: true,
  // });
  console.log(JSON.stringify(item, null, 2));
  openUserDialog('update',item)
};

// Open Trip Dialog, add or update database row
const openUserDialog = (pmode, pitem) => {
  // $q.dialog({
  //     title: 'Update',
  //     message: `<pre>${JSON.stringify(item, null, 2)}</pre>`,
  //     html: true
  //   })
  mode.value = pmode
  eitem.value = pitem
  isDialogOpen.value = true
}

const deleteUser = (item) => {
    $q.dialog({
      title: 'Delete ?',
      cancel: true,
      message: htmlDialogContent(
        'mdi-alert-outline', 'orange',
        `${item.name}<br><small>${item.email}<small>` ),
      html: true
    }).onOk(async() => {
        console.log('DELETE:')
        console.log(JSON.stringify(item, null,2))
        await userStore.deleteUser(item.id)
        reload()
    }).onCancel(() => {
      console.log('you pressed cancel.')
    })
  };
</script>
