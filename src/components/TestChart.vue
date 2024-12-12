<template>
  <div class="bar-chart">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref } from "vue";
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

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Static chart data for testing
const chartData = ref({
  labels: ["Category 1", "Category 2", "Category 3"],
  datasets: [
    {
      label: "Test Dataset",
      data: [10, 20, 30], // Must be an array of numbers
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      borderColor: "#333",
      borderWidth: 1,
    },
  ],
});

// Static chart options
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Simple Test Chart" },
  },
});
</script>

<style scoped>
.bar-chart {
  height: 400px;
  width: 600px;
}
</style>
