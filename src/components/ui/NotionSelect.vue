<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  id: { type: String, default: () => `select-${Math.random().toString(36).slice(2)}` },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-charcoal">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      class="w-full px-3 py-3 text-sm bg-canvas border border-hairline rounded-notion text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
