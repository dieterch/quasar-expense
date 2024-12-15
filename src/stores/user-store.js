import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { date } from 'quasar'
import { api } from "boot/axios";

// ----------------
// Helper Functions
// ----------------
// trips: transform a complex list of records from the databas to a flat list of records compatible with Q-Table
const uHelper = (list) => {
  let rows = [];
  list.map((row) => {
    let d = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role
    };
    rows.push(d);
  });
  return rows;
};

// ------
// Store
// ------
export const useUserStore = defineStore("user", () => {

  // ---------
  // user
  // ---------
  const users = ref();

  const tripDialogUsersColumns = ref(
  [
    {
      name: "name",
      align: "left",
      label: "Name",
      field: "name",
      style: "max-width: 150px",
      sortable: true,
    }
  ]);

  const allUserColumns =
  [
      {
        name: "name",
        align: "left",
        label: "Name",
        field: "name",
        headerStyle: 'padding-left: 32px;',
        sortable: true,
      },
      {
        name: "role",
        align: "left",
        label: "Role",
        field: "role",
        sortable: true,
      },
      {
        name: "actions",
        align: "center",
        label: "Actions",
      }
    ];

  // action: load all users from api
  const getUsers = async () => {
    const response = await api.get("/api/users");
    users.value = response.data;
  };

  // action: create or update database row
  const requestUsers = async ( method, payload ) => {
    const response = await api.request('/api/users', {
        method: method,
        data: payload,
        // headers: { "Content-Type": "application/json" },
    })
    // user has to reload database to update data
  }

  // action: delete trip from database
  const deleteUser = async (id) => {
  await api.delete("/api/users",{
    data: { id: id},
    // headers: { "Content-Type": "application/json" },
  })
  }

  // action: load filtered expenses from database
  const postTripUsers = async (tripid) => {
    const response = await api.post("/api/tripusers",{
      id: tripid,
      // headers: { "Content-Type": "application/json" },
    })
    users.value = response.data
  }

  // getter: transform trips to rows
  const usersRows = computed(() => {
    return users.value ? uHelper(users.value) : [];
  });

  return {
    // Users
    getUsers,
    requestUsers,
    deleteUser,
    postTripUsers,
    usersRows,
    users,
    tripDialogUsersColumns,
    allUserColumns

  };
});
