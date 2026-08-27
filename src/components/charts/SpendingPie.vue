<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useChartTheme } from '../../composables/useChartTheme.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const { palette, textColor } = useChartTheme()

const isSmUp = ref(typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)').matches : true)

let mq = null
function onMqChange(e) {
  isSmUp.value = e.matches
}

onMounted(() => {
  mq = window.matchMedia('(min-width: 640px)')
  mq.addEventListener('change', onMqChange)
})

onUnmounted(() => {
  mq?.removeEventListener('change', onMqChange)
})

const chartData = computed(() => ({
  labels: props.data.map((d) => d.name),
  datasets: [{
    data: props.data.map((d) => d.amount),
    backgroundColor: palette.value.slice(0, props.data.length),
    borderWidth: 0,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: isSmUp.value ? 'right' : 'bottom',
      labels: {
        boxWidth: 12,
        padding: 12,
        font: { size: 12 },
        color: textColor.value,
      },
    },
  },
}))
</script>

<template>
  <div class="h-72 sm:h-64">
    <Doughnut v-if="data.length" :data="chartData" :options="chartOptions" />
    <div v-else class="h-full flex items-center justify-center text-sm text-steel">
      No spending data for this month
    </div>
  </div>
</template>
