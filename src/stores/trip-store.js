import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { date } from 'quasar'
import { api } from "boot/axios";

// ----------------
// Helper Functions
// ----------------
// trips: transform a complex list of records from the databas to a flat list of records compatible with Q-Table
const tHelper = (list) => {
  let rows = [];
  list.map((row) => {
    let d = {
      id: row.id,
      name: row.name,
      rawdate: row.startDate,
      date: row.startDate,
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
export const useTripStore = defineStore("trip", () => {

  const alltripsColumns = ref(
  [
    {
      name: "date",
      align: "center",
      label: "Date",
      field: "date",
      format: (val) => `${date.formatDate(new Date(val),'DD.MM.YYYY')}`,
      style: "max-width: 50px",
      sortable: true,
    },
    {
      name: "name",
      align: "left",
      label: "Trip Name",
      field: "name",
      style: "max-width: 150px",
      sortable: true,
    },
    {
      name: "noExpenses",
      align: "center",
      label: "Expenses",
      field: "noExpenses",
      sortable: true,
    },
    {
      name: "actions",
      align: "center",
      label: "Actions",
    }
  ]);

  // Data
  const trips = ref();

  // action: load all trips from api
  const getTrips = async () => {
    const response = await api.get("/api/trips");
    trips.value = response.data;
  };

  // action: create or update database row
  const requestTrips = async ( method, payload ) => {
    const response = await api.request('/api/trips', {
        method: method,
        data: payload,
        headers: { "Content-Type": "application/json" },
    })
    // user has to reload database to update data
  }

  // action: delete trip from database
  const deleteTrip = async (id) => {
    await api.delete("/api/trips",{
      data: { id: id},
      headers: { "Content-Type": "application/json" },
    })
  }

  // getter: transform trips to rows
  const tripsRows = computed(() => {
    return trips.value ? tHelper(trips.value) : [];
  });

  return {
    // column definitions
    alltripsColumns,

    // Trips
    getTrips,
    requestTrips,
    deleteTrip,
    trips,
    tripsRows,
  };
});
