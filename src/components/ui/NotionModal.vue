<script setup>
import FeatherIcon from './FeatherIcon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-navy/40 dark:bg-black/60 backdrop-blur-sm" />
        <div class="relative bg-canvas rounded-notion-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto">
          <div v-if="title" class="flex items-center justify-between px-5 py-4 border-b border-hairline">
            <h2 class="text-lg font-semibold text-charcoal">{{ title }}</h2>
            <button
              class="text-steel hover:text-charcoal p-2 rounded-notion-sm"
              aria-label="Close"
              @click="$emit('update:modelValue', false)"
            >
              <FeatherIcon name="x" :size="18" />
            </button>
          </div>
          <div class="p-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
