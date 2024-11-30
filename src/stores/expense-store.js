import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { date } from 'quasar'
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
      date: row.date,
      trip: row.trip.name,
      categoryIcon: row.category.icon,
      categoryId: row.category.id,
      categoryName: row.category.name,
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
        // date.formatDate(timeStamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ')
        format: (val) => `${date.formatDate(new Date(val),'DD.MM.YYYY')}`,
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
        format: (val) => `${date.formatDate(new Date(val),'DD.MM.YYYY')}`,
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

  // action: delete expense from database
  const deleteExpense = async (id) => {
    await api.delete("/api/expenses",{
      data: { id: id},
      headers: { "Content-Type": "application/json" },
    })
  }

  // i leave this examples for getters with argumens
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

  return {
    // Expenses
    getExpenses,
    deleteExpense,
    postTripExpenses,
    requestExpenses,
    expenses,
    expensesRows,

    // column definitions
    tripexpensesColumns,
    allexpansesColumns,
  };
});
