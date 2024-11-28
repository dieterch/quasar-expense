<template>
  <q-page>
    <q-btn @click="fetchfilteredexpense(selectedTrip.id)">{{ selectedTrip.name }}</q-btn>
    <pre>{{ selectedTrip }}</pre>
    <pre>{{ storeExpense.expensesRows.length }} Expenses</pre>
    <pre>{{ storeExpense.expensesRows }}</pre>
    <pre>{{ storeExpense.expenses }}</pre>
  </q-page>
</template>

<script setup>
defineOptions({
  name: "TestPage",
});

import { ref, onMounted, reactive } from "vue";
import { useQuasar } from "quasar";
import { useExpenseStore } from 'stores/expense-store';
const storeExpense = useExpenseStore()

const expenses = ref()
const $q = useQuasar()
const selectedTrip = reactive({
  id: 0,
  name: "",
});

const fetchfilteredexpense = async(id) => {
  console.log("call fetch mit:", id)
  await storeExpense.postTripExpenses(id)
  expenses.value = storeExpense.expenses
}

onMounted(() => {
  const localdata = $q.localStorage.getItem('selectedTrip')
  if (localdata) Object.assign(selectedTrip, localdata)
})

</script>
