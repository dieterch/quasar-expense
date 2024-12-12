<template>
  <q-dialog v-model="internalShowDialog" persistent>
    <q-card style="width: 90vw; max-width: 800px;">
      <q-card-section>
        <div class="text-h6">Statistics Overview</div>
      </q-card-section>

      <q-card-section>
        <q-tabs v-model="activeTab" align="justify">
          <q-tab name="table" label="Table" />
          <q-tab name="chart" label="Chart" />
        </q-tabs>

        <q-tab-panels v-model="activeTab">
          <!-- Table Panel -->
          <q-tab-panel name="table">
            <q-table
              :rows="tableRowsWithTotals"
              :columns="tableColumns"
              row-key="category"
              dense
            >
              <template v-slot:body-cell-category="props">
                <q-td :props="props">
                  <strong>{{ props.row.category }}</strong>
                </q-td>
              </template>
              <template v-slot:body-cell="props">
                <q-td :props="props">
                  {{ props.row[props.col.name]?.toFixed(2) || "0.00" }}
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- Chart Panel -->
          <q-tab-panel name="chart">
            <div class="bar-chart">
              <BarChart :data="chartData" :options="chartOptions" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" @click="internalShowDialog = false" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  showDialog: {
    type: Boolean,
    required: true,
  },
});

// Emits
const emit = defineEmits(["update:showDialog"]);

// Reactive state for dialog visibility
const internalShowDialog = ref(props.showDialog);

// Watch for changes in the `showDialog` prop and sync the local state
watch(() => props.showDialog, (newVal) => {
  internalShowDialog.value = newVal;
});

// Emit changes to the parent whenever `internalShowDialog` changes
watch(internalShowDialog, (newVal) => {
  emit("update:showDialog", newVal);
});

// Tabs state
const activeTab = ref("table");

// Dynamic Table Columns
const tableColumns = computed(() => {
  const columns = [
    { name: "category", required: true, label: "Category", align: "left", field: "category" },
    { name: "all", label: "All Users", align: "right", field: "all" },
  ];

  // Add a column for each user
  Object.keys(props.data.data)
    .filter((key) => key !== "all")
    .forEach((user) => {
      columns.push({
        name: user,
        label: user,
        align: "right",
        field: user,
      });
    });

  return columns;
});

// Compute table rows
const tableRows = computed(() => {
  const rows = [];

  // Iterate over all categories in the "all" data
  Object.keys(props.data.data.all).forEach((category) => {
    const row = { category, all: props.data.data.all[category]?.amount || 0 };

    // Add user-specific amounts for this category
    Object.keys(props.data.data)
      .filter((key) => key !== "all")
      .forEach((user) => {
        row[user] = props.data.data[user][category]?.amount || 0;
      });

    rows.push(row);
  });

  return rows;
});

// Add totals row
const tableRowsWithTotals = computed(() => {
  const rows = tableRows.value;

  const totalsRow = {
    category: "Total",
    all: rows.reduce((sum, row) => sum + row.all, 0),
  };

  // Compute totals for each user
  Object.keys(props.data.data)
    .filter((key) => key !== "all")
    .forEach((user) => {
      totalsRow[user] = rows.reduce((sum, row) => sum + (row[user] || 0), 0);
    });

  return [...rows, totalsRow];
});

// Chart data
const chartData = computed(() => ({
  labels: Object.keys(props.data.data.all),
  datasets: [
    {
      label: "All Users",
      backgroundColor: "#42A5F5",
      data: Object.values(props.data.data.all).map((item) => item.amount),
    },
    ...Object.entries(props.data.data)
      .filter(([key]) => key !== "all")
      .map(([user, categories]) => ({
        label: user,
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        data: Object.keys(props.data.data.all).map((category) =>
          categories[category]?.amount || 0
        ),
      })),
  ],
}));

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Expenses by Category and User" },
  },
};
</script>

<style scoped>
.bar-chart {
  height: 300px;
  width: 100%; /* Ensure proper size */
}
</style>
