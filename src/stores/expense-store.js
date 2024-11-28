import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api } from "boot/axios";

// ----------------
// Helper Functions
// ----------------
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
      currency: row.currency,
      amount: row.amount.toFixed(2),
      user: row.user.name,
      userId: row.user.id
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

// ------
// Store
// ------
export const useExpenseStore = defineStore("expense", () => {



// --------
// expenses
// --------
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

  // data:
  const expenses = ref();

  // getter: transform expenses to rows
  const expensesRows = computed(() => {
    return expenses.value ? eHelper(expenses.value) : [];
  });

  // action: load all expenses from database
  const getExpenses = async () => {
    const response = await api.get("/api/expenses");
    expenses.value = response.data;
  };

  // action: load filtered expenses from database
  const postTripExpenses = async (tripid) => {
    const response = await api.post("/api/tripexpenses",{
      id: tripid,
      headers: { "Content-Type": "application/json" },
    })
    expenses.value = response.data
  }

  // action: create or update database row
  const requestExpenses = async ( method, payload ) => {
    const response = await api.request('/api/expenses', {
        method: method,
        data: payload,
        headers: { "Content-Type": "application/json" },
    })
    // user has to reload database to update data
  }

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

  // ----------
  // trips
  // ----------
  const trips = ref();

  // action: load all trips from api
  const getTrips = async () => {
    const response = await api.get("/api/trips");
    trips.value = response.data;
  };

  // getter: transform trips to rows
  const tripsRows = computed(() => {
    return trips.value ? tHelper(trips.value) : [];
  });

  // ----------
  // categories
  // ----------
  const categories = ref();

  // action: load all categories from api
  const getCategories = async () => {
    const response = await api.get("/api/categories");
    categories.value = response.data;
  };


  // ---------
  // user
  // ---------
  const users = ref();

  // action: load all users from api
  const getUsers = async () => {
    const response = await api.get("/api/users");
    users.value = response.data;
  };

  // action: load filtered expenses from database
  const postTripUsers = async (tripid) => {
    const response = await api.post("/api/tripusers",{
      id: tripid,
      headers: { "Content-Type": "application/json" },
    })
    users.value = response.data
  }


  return {
    // Expenses
    getExpenses,
    postTripExpenses,
    requestExpenses,
    expenses,
    expensesRows,

    // getters for fileterd expenses ... ?!
    // filteredExpenses,
    // filteredExpensesRows,

    // column definitions
    tripexpensesColumns,
    allexpansesColumns,

    // Trips
    getTrips,
    trips,
    tripsRows,

    // Categories
    getCategories,
    categories,

    // Users
    getUsers,
    postTripUsers,
    users
  };
});
