<template>

<q-page class="flex flex-center">
    <div class="bg-grey-3 q-pa-md elevated" style="min-width: 250px; max-width: 250px;">
      <div class="text-center text-h4 text-primary">Counter</div>
      <!-- Use the destructured state -->
      <div class="text-center text-h4 q-pa-sm bg-white">{{ storeCounter.count }}</div>
      <!-- Manipulate state directly-->

      <div class="text-center q-pt-md q-gutter-md">
        <q-btn round @click="storeCounter.decreaseCount" class="bg-primary text-white text-h7">-</q-btn>
        <q-btn round @click="storeCounter.increaseCount" class="bg-primary text-white text-h7">+</q-btn>
      </div>

      <hr class="q-ma-md text-grey-1">
      <div class="text-center text-h6 text-grey-7">
        This counter is: {{ storeCounter.oddOrEven }}
      </div>
      <hr class="q-ma-md text-grey-1">
      <div class="text-center text-h5">
        Edit Counter:
        <input
          v-model="storeCounter.count"
          type="number"
          style="max-width: 140px;"
          class="text-center"
        />
      </div>
    </div>
</q-page>
</template>

<script setup>

defineOptions({
  name: 'UsersPage'
});


import { storeToRefs } from 'pinia';
import { useCounterStore } from 'stores/counter';
const storeCounter = useCounterStore();

</script>


