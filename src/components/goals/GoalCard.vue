<script setup>
import { computed } from 'vue'
import NotionButton from '../ui/NotionButton.vue'
import { useCurrency } from '../../composables/useCurrency.js'

const props = defineProps({
  goal: { type: Object, required: true },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'add-money', 'toggle-select'])

const { formatCurrency } = useCurrency()

const progress = computed(() => {
  if (!props.goal.target_amount) return 0
  return Math.min(100, Math.round((props.goal.current_amount / props.goal.target_amount) * 100))
})
</script>

<template>
  <div
    class="bg-canvas border rounded-notion-lg p-5 transition-colors"
    :class="selected ? 'border-primary/40 bg-primary/5' : 'border-hairline'"
  >
    <div class="flex items-start justify-between mb-3 gap-2">
      <div class="flex items-start gap-2 min-w-0">
        <input
          v-if="selectable"
          type="checkbox"
          :checked="selected"
          class="mt-0.5 rounded border-hairline text-primary focus:ring-primary/30"
          @change="$emit('toggle-select', goal.id)"
        />
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-charcoal">{{ goal.name }}</h3>
          <p v-if="goal.deadline" class="text-xs text-steel mt-0.5">Target: {{ goal.deadline }}</p>
        </div>
      </div>
      <div class="flex gap-1 shrink-0">
        <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary" @click="$emit('edit', goal)">Edit</button>
        <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="$emit('delete', goal.id)">Delete</button>
      </div>
    </div>

    <div class="mb-2">
      <div class="flex justify-between text-xs text-steel mb-1">
        <span>{{ formatCurrency(goal.current_amount) }}</span>
        <span>{{ formatCurrency(goal.target_amount) }}</span>
      </div>
      <div class="h-2.5 bg-surface rounded-notion-sm overflow-hidden">
        <div
          class="h-full rounded-notion-sm transition-all duration-500"
          :style="{ width: `${progress}%`, backgroundColor: goal.color || '#5645d4' }"
        />
      </div>
      <p class="text-xs text-steel mt-1 text-right">{{ progress }}%</p>
    </div>

    <NotionButton size="sm" variant="secondary" class="w-full mt-2" @click="$emit('add-money', goal)">
      Add Money
    </NotionButton>
  </div>
</template>
