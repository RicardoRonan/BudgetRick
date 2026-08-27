<script setup>
defineProps({
  padding: { type: Boolean, default: true },
  hover: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="bg-canvas dark:bg-surface border border-hairline rounded-notion-lg"
    :class="{
      'p-3 sm:p-4': padding,
      'hover:shadow-sm transition-shadow': hover,
    }"
  >
    <slot />
  </div>
</template>
