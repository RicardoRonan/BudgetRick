<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useChartTheme } from '../../composables/useChartTheme.js'
import { useCurrency } from '../../composables/useCurrency.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps({
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
})

const { successColor, errorColor, gridColor, textColor } = useChartTheme()
const { formatCompact } = useCurrency()

const chartData = computed(() => ({
  labels: ['Income', 'Expenses'],
  datasets: [{
    data: [props.income, props.expenses],
    backgroundColor: [successColor.value, errorColor.value],
    borderRadius: 8,
    barThickness: 48,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  layout: {
    padding: { left: 4, right: 8 },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: gridColor.value },
      ticks: {
        color: textColor.value,
        maxTicksLimit: 6,
        callback: (val) => formatCompact(val),
      },
    },
    x: {
      grid: { display: false },
      ticks: { color: textColor.value },
    },
  },
}))
</script>

<template>
  <div class="h-48">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
