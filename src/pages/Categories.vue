<template>
  <q-page>
<div class="row justify-around">
  <div class="col-auto q-mt-lg">
      <q-btn class="counter-button">
        {{ storeCounter.count }}
      </q-btn>
  </div>
</div>
<div class="row justify-around q-mt-lg">
  <div>
    <pre class="debug">{{ storeExpense.tripsRows }}</pre>
  </div>
</div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'CategoriesPage'
});

import { onMounted } from 'vue';
import { useCounterStore } from 'stores/counter';
const storeCounter = useCounterStore()

import { useExpenseStore } from 'stores/expense-store';
import { storeToRefs } from 'pinia';
const storeExpense = useExpenseStore()

onMounted(async() => {
  await storeExpense.fetchExpenses()
  await storeExpense.fetchTrips()
})

</script>

<style scoped>
.counter-button {
  font-size: 40px;
  width: 60px;
  height: 60px;
}

.debug {
  font-size: xx-small;
}

</style>
