<script setup>
import { computed } from 'vue'
import feather from 'feather-icons'
import { normalizeIconName } from '../../design/icons.js'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
  strokeWidth: { type: [Number, String], default: 2 },
})

const svg = computed(() => {
  const iconName = normalizeIconName(props.name)
  const icon = feather.icons[iconName] || feather.icons.circle
  return icon.toSvg({
    width: props.size,
    height: props.size,
    'stroke-width': props.strokeWidth,
    class: 'feather-stroke',
  })
})
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center [&_svg]:stroke-current" v-html="svg" aria-hidden="true" />
</template>
