<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler } from 'chart.js'
import { useChartTheme } from '../../composables/useChartTheme.js'
import { useCurrency } from '../../composables/useCurrency.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps({
  months: { type: Array, default: () => [] },
})

const { successColor, errorColor, successFill, errorFill, gridColor, textColor } = useChartTheme()
const { formatCompact } = useCurrency()

const chartData = computed(() => ({
  labels: props.months.map((m) => m.label),
  datasets: [
    {
      label: 'Income',
      data: props.months.map((m) => m.income),
      borderColor: successColor.value,
      backgroundColor: successFill.value,
      fill: true,
      tension: 0.3,
    },
    {
      label: 'Expenses',
      data: props.months.map((m) => m.expenses),
      borderColor: errorColor.value,
      backgroundColor: errorFill.value,
      fill: true,
      tension: 0.3,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        color: textColor.value,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: gridColor.value },
      ticks: {
        color: textColor.value,
        callback: (val) => formatCompact(val),
      },
    },
    x: {
      grid: { color: gridColor.value },
      ticks: { color: textColor.value },
    },
  },
}))
</script>

<template>
  <div class="h-56">
    <Line v-if="months.length" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-sm text-steel">
      Not enough data for trend
    </div>
  </div>
</template>
