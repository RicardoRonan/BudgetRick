<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'All' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const displayLabel = computed(() => {
  if (!props.modelValue.length) return props.placeholder
  if (props.modelValue.length === 1) {
    const opt = props.options.find((o) => o.value === props.modelValue[0])
    return opt?.label || props.placeholder
  }
  return `${props.modelValue.length} selected`
})

function isChecked(value) {
  return props.modelValue.includes(value)
}

function toggle(value) {
  const next = new Set(props.modelValue)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  emit('update:modelValue', [...next])
}

function clearAll() {
  emit('update:modelValue', [])
}

function onClickOutside(event) {
  if (root.value && !root.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="root" class="relative flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-charcoal">{{ label }}</label>
    <button
      type="button"
      class="inline-flex items-center justify-between gap-2 min-w-[10rem] px-3 py-2 text-sm bg-canvas border border-hairline rounded-notion text-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
      @click.stop="open = !open"
    >
      <span class="truncate">{{ displayLabel }}</span>
      <FeatherIcon :name="open ? 'chevron-up' : 'chevron-down'" :size="14" class="shrink-0 text-steel" />
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 z-40 mt-1 w-full min-w-[12rem] max-h-60 overflow-y-auto bg-canvas border border-hairline rounded-notion shadow-lg py-1"
    >
      <button
        type="button"
        class="w-full px-3 py-2 text-left text-xs text-steel hover:bg-surface hover:text-charcoal"
        @click="clearAll"
      >
        Clear selection
      </button>
      <label
        v-for="opt in options"
        :key="opt.value"
        class="flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-surface cursor-pointer"
      >
        <input
          type="checkbox"
          :checked="isChecked(opt.value)"
          class="rounded border-hairline text-primary focus:ring-primary/30"
          @change="toggle(opt.value)"
        />
        <span class="truncate">{{ opt.label }}</span>
      </label>
      <p v-if="!options.length" class="px-3 py-2 text-xs text-steel">No options</p>
    </div>
  </div>
</template>
