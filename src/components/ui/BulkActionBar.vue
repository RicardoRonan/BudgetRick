<script setup>
defineProps({
  count: { type: Number, default: 0 },
})

defineEmits(['clear'])
</script>

<template>
  <div
    v-if="count > 0"
    class="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-notion"
  >
    <span class="text-sm font-medium text-charcoal">{{ count }} selected</span>
    <div class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
    <button
      type="button"
      class="text-xs text-steel hover:text-charcoal ml-auto px-2 py-1.5 min-h-[36px]"
      @click="$emit('clear')"
    >
      Clear
    </button>
  </div>
</template>
