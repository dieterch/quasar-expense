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
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'ExpensesPage'
});

import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar';

const rows = ref([])

onMounted(async () => {
  const expenses = await api.get('/api/expenses')
  expenses.data.map((row) => {
    let d = {
      id: row.id,
      date: new Date(row.date).toLocaleDateString("de-CA", {year:"numeric", month: "2-digit", day:"2-digit"}),
      trip: row.trip.name,
      category: row.category.name,
      description: row.description,
      amount: row.amount.toFixed(2),
      user: row.user.name
    }
    rows.value.push(d)
  })
  console.log(rows)
})

const columns = [
{ name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
{ name: 'date', align: 'right', label: 'Date', field: 'date', sortable: true },
{ name: 'trip', align: 'left',  label: 'Trip', field: 'trip', sortable: true },
{ name: 'category', align: 'center',  label: 'Cat', field: 'category', sortable: true },
{ name: 'description', align: 'left',  label: 'Description', field: 'description', sortable: true },
{ name: 'expense', align: 'right',  label: 'Expense', field: 'amount', format: val => `${val} €`, sortable: true },
{ name: 'user', align: 'left',  label: 'User', field: 'user', sortable: true }
]

// const initialPagination = {
//         sortBy: 'date',
//         descending: false,
//         page: 2,
//         rowsPerPage: 3
//         // rowsNumber: xx if getting data from a server
//       }

const customSort = (rows, sortBy, descending) => {
        const data = [...rows]

        if (sortBy) {
          data.sort((a, b) => {
            const x = descending ? b : a
            const y = descending ? a : b

            // if (sortBy === 'name') {
            //   // string sort
            //   return x[ sortBy ] > y[ sortBy ] ? 1 : x[ sortBy ] < y[ sortBy ] ? -1 : 0
            // } else
            if (sortBy === 'date') {
              // Date sort
              return new Date(x[ sortBy ]) > new Date(y[ sortBy ]) ? 1: new Date(x[ sortBy ]) < new Date(y[ sortBy ]) ? -1 : 0
            } else {
              // string sort
              return x[ sortBy ] > y[ sortBy ] ? 1 : x[ sortBy ] < y[ sortBy ] ? -1 : 0
            }
            // {
            //   // numeric sort
            //   return parseFloat(x[ sortBy ]) - parseFloat(y[ sortBy ])
            // }
          })
        }
        return data
      }

</script>
