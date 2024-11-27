import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from "boot/axios";

const eHelper = (list) => {
  let rows=[]
  list.map((row) => {
    let d = {
      id: row.id,
      rawdate: row.date,
      date: new Date(row.date).toLocaleDateString("de-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      trip: row.trip.name,
      categoryIcon: row.category.icon,
      category: row.category.name,
      description: row.description,
      amount: row.amount.toFixed(2),
      user: row.user.name,
    };
    rows.push(d);
  });
  return rows
}
const tHelper = (list) => {
  let rows=[]
  list.map((row) => {
    let d = {
      id: row.id,
      name: row.name,
      participants: row.users.map(item => item.user.name).join(", "),
      noExpenses: row.expenses.length || 0,
    };
    rows.push(d);
  });
  return rows
}

export const useExpenseStore = defineStore('expense',() => {

  const expenses = ref()

  const fetchExpenses = async () => {
    const response = await api.get("/api/expenses");
    expenses.value = response.data
  }

  const expensesRows = computed(() => {
    return (expenses.value) ? eHelper(expenses.value) : []
  })

  const filteredExpenses = computed(() => {
    return (id) => {
      if (expenses.value) {
        return expenses.value.filter((e) => e.tripId == id )
      }
    }
  })

  const filteredExpensesRows = computed(() => {
    return (id) => {
      return (expenses.value) ? eHelper(filteredExpenses.value(id)) : []
    }
  })

  const trips = ref()
  // const tripsrows = ref([])

  const fetchTrips = async () => {
    const response = await api.get("/api/trips");
    trips.value = response.data
    // return expenses.value
  }

  const tripsRows = computed(() => {
    return (trips.value) ? tHelper(trips.value) : []
  })

  return {
    fetchExpenses, expenses, expensesRows, filteredExpenses, filteredExpensesRows,
    fetchTrips, trips, tripsRows
   }
})
