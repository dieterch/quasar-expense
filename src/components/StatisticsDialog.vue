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
            <div style="overflow-x: auto;">
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
            </div>
          </q-tab-panel>

          <!-- Chart Panel -->
          <q-tab-panel name="chart">
            <div class="chart-controls">
              <q-select
                v-model="selectedUser"
                :options="userOptions"
                option-value="value"
                label="Select User"
                dense
                borderless
                class="large-dropdown"
              />
            </div>
            <div class="pie-chart">
              <Pie :data="chartData" :options="chartOptions" />
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
import { ref, computed, watch } from "vue";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

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

// Dropdown state
const selectedUser = ref({ label:'all', value:'all'});

// Dropdown options
const userOptions = computed(() => {
  const options = [{ label: "Totals", value: "all" }];
  Object.keys(props.data.data)
    .filter((key) => key !== "all")
    .forEach((user) => {
      options.push({ label: user, value: user });
    });
  return options;
});

// Table columns
const tableColumns = computed(() => {
  const columns = [
    { name: "category", required: true, label: "Category", align: "left", field: "category" },
    { name: "all", label: "Totals", align: "right", field: "all" },
  ];
  Object.keys(props.data.data)
    .filter((key) => key !== "all")
    .forEach((user) => {
      columns.push({ name: user, label: user, align: "right", field: user });
    });
  return columns;
});

// Compute table rows
const tableRowsWithTotals = computed(() => {
  const rows = [];
  const totalsRow = { category: "Total", all: 0 };

  Object.keys(props.data.data.all).forEach((category) => {
    const row = { category, all: props.data.data.all[category]?.amount || 0 };
    totalsRow.all += row.all;

    Object.keys(props.data.data)
      .filter((key) => key !== "all")
      .forEach((user) => {
        row[user] = props.data.data[user][category]?.amount || 0;
        totalsRow[user] = (totalsRow[user] || 0) + row[user];
      });

    rows.push(row);
  });

  rows.push(totalsRow);
  return rows;
});

// // Reactive chart data
const chartData = computed(() => {
  const user = selectedUser.value;
  const currentData = props.data.data[user.value] || {}; // Fallback to empty object
  // console.log('in chartData computed ... user:', user.value, ' currentData:', currentData)
  const labels = Object.keys(currentData);
  const data = Object.values(currentData).map((item) => Math.round(item.amount));

  return {
    labels,
    datasets: [
      {
        label: user.value === "all" ? "Totals" : `Expenses for ${user.value}`,
        data,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };
});

// Custom plugin to display data inside chart segments
// const dataLabelPlugin = {
//   id: "dataLabelPlugin",
//   beforeDraw(chart) {
//     const ctx = chart.ctx;
//     ctx.save();
//     chart.data.datasets.forEach((dataset, datasetIndex) => {
//       const meta = chart.getDatasetMeta(datasetIndex);
//       meta.data.forEach((element, index) => {
//         const value = dataset.data[index];
//         const { x, y } = element.tooltipPosition();
//         ctx.fillStyle = "#000";
//         ctx.font = "bold 12px Arial";
//         ctx.textAlign = "center";
//         ctx.fillText(`${value} €`, x, y);
//       });
//     });
//     ctx.restore();
//   },
// };

// Chart options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right" },
    title: { display: false, text: "Expenses Distribution" },
  },
 // plugins: [dataLabelPlugin],
});
</script>

<style scoped>
.pie-chart {
  height: 400px;
  width: 400px;
  margin: 0 auto;
}
.chart-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.large-dropdown {
  min-width: 200px;
}
</style>
