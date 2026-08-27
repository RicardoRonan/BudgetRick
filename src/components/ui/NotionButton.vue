<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-medium transition-colors rounded-notion disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'bg-primary text-white hover:bg-primary-pressed': variant === 'primary',
      'bg-canvas dark:bg-surface text-charcoal border border-hairline hover:bg-surface': variant === 'secondary',
      'text-steel hover:bg-surface hover:text-charcoal': variant === 'ghost',
      'bg-error text-white hover:bg-error/90': variant === 'danger',
      'px-3 py-2 min-h-[36px] text-sm': size === 'sm',
      'px-4 py-2.5 min-h-[44px] text-sm': size === 'md',
      'px-5 py-3 min-h-[48px] text-base': size === 'lg',
    }"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
