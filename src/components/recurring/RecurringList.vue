<script setup>
import RecurringRow from './RecurringRow.vue'
import { useCategoriesStore } from '../../stores/categories.js'
import { useCurrency } from '../../composables/useCurrency.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  selectable: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },
  someSelected: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'toggle', 'toggle-select', 'toggle-select-all'])

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

function isSelected(id) {
  return props.selectedIds.includes(id)
}
</script>

<template>
  <div class="bg-canvas border border-hairline rounded-notion-lg overflow-hidden">
    <!-- Mobile cards -->
    <div class="md:hidden p-3 space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="border border-hairline rounded-notion p-3 space-y-2"
        :class="isSelected(item.id) ? 'bg-primary/5 border-primary/30' : ''"
      >
        <div class="flex items-start gap-2">
          <input
            v-if="selectable"
            type="checkbox"
            :checked="isSelected(item.id)"
            class="mt-0.5 rounded border-hairline text-primary focus:ring-primary/30"
            @change="$emit('toggle-select', item.id)"
          />
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-charcoal">{{ item.name }}</span>
              <span class="text-sm font-medium text-charcoal">{{ formatCurrency(item.amount) }}</span>
            </div>
            <p class="text-xs text-steel">
              {{ getCategory(item.category_id)?.name || '—' }} · {{ frequencyLabels[item.frequency] || item.frequency }}
            </p>
            <p class="text-sm text-charcoal">Next: {{ item.next_date }}</p>
            <div class="flex items-center justify-between pt-1">
              <button
                class="text-xs px-3 py-1.5 min-h-[36px] rounded-notion-sm"
                :class="item.is_active ? 'bg-tint-mint text-success' : 'bg-surface text-steel'"
                @click="$emit('toggle', item)"
              >
                {{ item.is_active ? 'Active' : 'Inactive' }}
              </button>
              <div class="flex gap-2">
                <button
                  class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary"
                  @click="$emit('edit', item)"
                >
                  Edit
                </button>
                <button
                  class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error"
                  @click="$emit('delete', item.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!items.length" class="py-8 text-center text-sm text-steel">
        No recurring bills yet
      </p>
    </div>

    <!-- Desktop table -->
    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hidden md:block">
      <table class="w-full hidden md:table">
        <thead>
          <tr class="text-xs text-steel border-b border-hairline">
            <th v-if="selectable" class="py-2 px-2 w-10">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="rounded border-hairline text-primary focus:ring-primary/30"
                title="Select all"
                @change="$emit('toggle-select-all')"
              />
            </th>
            <th class="py-2 px-3 text-left font-medium">Name</th>
            <th class="py-2 px-3 text-right font-medium">Amount</th>
            <th class="py-2 px-3 text-left font-medium">Category</th>
            <th class="py-2 px-3 text-left font-medium">Frequency</th>
            <th class="py-2 px-3 text-left font-medium">Next Due</th>
            <th class="py-2 px-3 text-left font-medium">Reminder</th>
            <th class="py-2 px-3 text-left font-medium">Status</th>
            <th class="py-2 px-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <RecurringRow
            v-for="item in items"
            :key="item.id"
            :item="item"
            :selectable="selectable"
            :selected="isSelected(item.id)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @toggle="$emit('toggle', $event)"
            @toggle-select="$emit('toggle-select', $event)"
          />
          <tr v-if="!items.length">
            <td :colspan="selectable ? 9 : 8" class="py-8 text-center text-sm text-steel">
              No recurring bills yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
