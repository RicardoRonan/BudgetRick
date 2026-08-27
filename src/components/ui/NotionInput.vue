<script setup>
import { computed, ref } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: () => `input-${Math.random().toString(36).slice(2)}` },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)

const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-charcoal">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        class="w-full px-3 py-3 text-sm bg-canvas border border-hairline rounded-notion text-ink placeholder:text-steel focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        :class="isPassword ? 'pr-10' : ''"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-notion-sm text-steel hover:text-charcoal hover:bg-surface transition-colors"
        :title="showPassword ? 'Hide password' : 'Show password'"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="togglePasswordVisibility"
      >
        <FeatherIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
      </button>
    </div>
    <p v-if="error" class="text-xs text-error">{{ error }}</p>
  </div>
</template>
