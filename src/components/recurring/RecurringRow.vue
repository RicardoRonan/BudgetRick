<script setup>
import { useCategoriesStore } from '../../stores/categories.js'
import { useCurrency } from '../../composables/useCurrency.js'

defineProps({
  item: { type: Object, required: true },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'toggle', 'toggle-select'])

const categoriesStore = useCategoriesStore()
const { formatCurrency } = useCurrency()

const frequencyLabels = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

function getCategory(id) {
  return categoriesStore.getCategoryById(id)
}
</script>

<template>
  <tr
    class="border-b border-hairline transition-colors"
    :class="selected ? 'bg-primary/5' : 'hover:bg-surface/50'"
  >
    <td v-if="selectable" class="py-2.5 px-2 w-10">
      <input
        type="checkbox"
        :checked="selected"
        class="rounded border-hairline text-primary focus:ring-primary/30"
        @change="$emit('toggle-select', item.id)"
      />
    </td>
    <td class="py-2.5 px-3 text-sm text-charcoal">{{ item.name }}</td>
    <td class="py-2.5 px-3 text-sm text-right font-medium">{{ formatCurrency(item.amount) }}</td>
    <td class="py-2.5 px-3 text-sm text-steel">
      {{ getCategory(item.category_id)?.name || '—' }}
    </td>
    <td class="py-2.5 px-3 text-sm text-steel">{{ frequencyLabels[item.frequency] || item.frequency }}</td>
    <td class="py-2.5 px-3 text-sm text-charcoal">{{ item.next_date }}</td>
    <td class="py-2.5 px-3 text-sm text-steel">{{ item.reminder_days ?? 3 }} days</td>
    <td class="py-2.5 px-3">
      <button
        class="text-xs px-3 py-1.5 min-h-[36px] rounded-notion-sm"
        :class="item.is_active ? 'bg-tint-mint text-success' : 'bg-surface text-steel'"
        @click="$emit('toggle', item)"
      >
        {{ item.is_active ? 'Active' : 'Inactive' }}
      </button>
    </td>
    <td class="py-2.5 px-3 text-right">
      <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary mr-2" @click="$emit('edit', item)">Edit</button>
      <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="$emit('delete', item.id)">Delete</button>
    </td>
  </tr>
</template>
