import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export const useCounterStore = defineStore('counter', () => {

  const count = ref(0)

  const oddOrEven = computed(() =>
  { return (count.value % 2 === 0) ? 'even':'odd'})

  const  increaseCount = () => { count.value++ }
  const  decreaseCount = () => { count.value++ }

  return { count, increaseCount, decreaseCount, oddOrEven }
})


