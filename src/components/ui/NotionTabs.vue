<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="overflow-x-auto">
    <div class="inline-flex bg-surface border border-hairline rounded-notion p-0.5 whitespace-nowrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-3 py-2 min-h-[36px] text-sm font-medium rounded-notion-sm transition-colors whitespace-nowrap"
      :class="modelValue === tab.value
        ? 'bg-canvas text-charcoal shadow-sm dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]'
        : 'text-steel hover:text-charcoal'"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
    </div>
  </div>
</template>
