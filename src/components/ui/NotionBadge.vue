<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui.js'
import { getBadgeStyle } from '../../design/colors.js'

const props = defineProps({
  label: { type: String, required: true },
  color: { type: String, default: '#e6e0f5' },
})

const uiStore = useUiStore()
const { resolvedTheme } = storeToRefs(uiStore)

const badgeStyle = computed(() =>
  getBadgeStyle(props.color, resolvedTheme.value === 'dark')
)
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-notion-sm"
    :style="badgeStyle"
  >
    {{ label }}
  </span>
</template>
