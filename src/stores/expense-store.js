import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "boot/axios";

// Helper Functions:
// -----------------

// expenses: transform a complex list of records from the databas to a flat list of records compatible with Q-Table
const eHelper = (list) => {
  let rows = [];
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
  return rows;
};

// trips: transform a complex list of records from the databas to a flat list of records compatible with Q-Table
const tHelper = (list) => {
  let rows = [];
  list.map((row) => {
    let d = {
      id: row.id,
      name: row.name,
      rawdate: row.startDate,
      date: new Date(row.startDate).toLocaleDateString("de-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      participants: row.users.map((item) => item.user.name).join(", "),
      noExpenses: row.expenses.length || 0,
    };
    rows.push(d);
  });
  return rows;
};

// Store:
// ------
export const useExpenseStore = defineStore("expense", () => {
  // expenses part
  // -------------
  const expenses = ref();
  const tripexpensesColumns = ref(
    [{
        name: "date",
        align: "center",
        label: "Date",
        field: "date",
        style: "max-width: 50px",
        sortable: true,
      },
      {
        name: "description",
        align: "left",
        label: "Description",
        field: "description",
        style: "max-width: 150px",
        sortable: true,
      },
      {
        name: "expense",
        align: "right",
        label: "Expense",
        field: "amount",
        format: (val) => `${val} €`,
        sortable: true,
      },
      {
        name: "actions",
        align: "center",
        label: "Actions",
      }]
  )
  const allexpansesColumns = ref(
    [{
        name: "date",
        align: "center",
        label: "Date",
        field: "date",
        style: 'max-width: 50px',
        sortable: true,
      },
      {
        name: "trip",
        align: "left",
        label: "Trip",
        field: "trip",
        style: 'max-width: 150px',
        sortable: true,
      },
      {
        name: "expense",
        align: "right",
        label: "Expense",
        field: "amount",
        format: (val) => `${val} €`,
        sortable: true,
      },
      {
        name: "actions",
        align: "center",
        label: "Actions",
      }]
  )

  // action: load all expense data from api
  const fetchExpenses = async () => {
    const response = await api.get("/api/expenses");
    expenses.value = response.data;
  };

  const fetchfilteredexpenses = async (tripid) => {
    // console.log(`fetchfilterexpenses(${tripid})`)
    const response = await api.post("/api/tripexpenses",{
      id: tripid,
      headers: { "Content-Type": "application/json" },
    })
    expenses.value = response.data
  }

  // getter: transform expenses to rows
  const expensesRows = computed(() => {
    return expenses.value ? eHelper(expenses.value) : [];
  });

  // // getter: filter expenses with trip id in frontend
  // const filteredExpenses = computed(() => {
  //   return (id) => {
  //     if (expenses.value) {
  //       return expenses.value.filter((e) => e.tripId == id);
  //     }
  //   };
  // });

  // // getter: filter expenses with trip id in frontend and transform to rows
  // const filteredExpensesRows = computed(() => {
  //   return (id) => {
  //     return expenses.value ? eHelper(filteredExpenses.value(id)) : [];
  //   };
  // });

  // trips part
  // ----------
  const trips = ref();

  // action: load all trips from api
  const fetchTrips = async () => {
    const response = await api.get("/api/trips");
    trips.value = response.data;
    // return expenses.value
  };

  // getter: transform trips to rows
  const tripsRows = computed(() => {
    return trips.value ? tHelper(trips.value) : [];
  });

  return {
    // Expenses
    fetchExpenses,
    fetchfilteredexpenses,
    expenses,
    expensesRows,

    // getters for fileterd expenses ... ?!
    // filteredExpenses,
    // filteredExpensesRows,

    // column definitions
    tripexpensesColumns,
    allexpansesColumns,

    // Trips
    fetchTrips,
    trips,
    tripsRows,
  };
});
