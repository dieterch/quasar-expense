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
          <q-tab-panel name="table">
            <div style="overflow-x: auto;">
              <q-table
                :rows="tableRowsWithTotals"
                :columns="tableColumns"
                row-key="category"
                dense
              />
            </div>
          </q-tab-panel>

          <q-tab-panel name="chart">
            <div class="pie-chart">
              <Pie :data="chartData" :options="chartOptions" />
            </div>
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
import { ellipsis } from "src/utils/helpers";
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
const selectedUser = ref({ label: "all", value: "all" });

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
    { name: "category", required: true, label: "Category",
      align: "left", field: "category", style: 'max-width: 0px', format: (val, row) => `${ellipsis(val,10)}`},
    { name: "all", label: "Totals", align: "right", field: "all", format: (val,row) => `${val.toFixed(0)}` },
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

// Reactive chart data
const chartData = computed(() => {
  const user = selectedUser.value;
  const currentData = props.data.data[user.value] || {}; // Fallback to empty object
  const labels = Object.keys(currentData).map(l => ellipsis(l,10));
  const amounts = Object.values(currentData).map((item) => Math.round(item.amount));
  const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
  const percentages = amounts.map((value) => ((value / totalAmount) * 100).toFixed(1)); // Rounded to 1 digit

  return {
    labels,
    datasets: [
      {
        label: user.value === "all" ? "Totals" : `Expenses for ${user.value}`,
        data: amounts,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        percentages,
      },
    ],
  };
});

// Chart options with custom tooltip
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right" },
    title: { display: false, text: "Expenses Distribution" },
    tooltip: {
      callbacks: {
        label: function (context) {
          const dataset = context.dataset;
          const index = context.dataIndex;
          const amount = dataset.data[index];
          const percentage = dataset.percentages[index];

          // Format the tooltip with labels left-aligned and values right-aligned
          return [
            `  Amount:  ${amount.toFixed(1).padStart(12, " ")}€`,
            `  Share:          ${percentage.padStart(8, " ")}%`,
          ];
        },
      },
    },
  },
});
</script>

<style scoped>
.pie-chart {
  height: 300px;
  width: 280px;
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
