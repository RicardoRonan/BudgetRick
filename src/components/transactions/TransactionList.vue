<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import TransactionRow from './TransactionRow.vue'
import NotionBadge from '../ui/NotionBadge.vue'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { useCategoriesStore } from '../../stores/categories.js'
import { useCurrency } from '../../composables/useCurrency.js'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },
  allSelected: { type: Boolean, default: false },
  someSelected: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'toggle-select', 'toggle-select-all'])

const categoriesStore = useCategoriesStore()
const { formatCurrency } = useCurrency()
const expandedIds = ref({})

function getCategory(id) {
  return categoriesStore.getCategoryById(id)
}

function hasSplits(tx) {
  return tx.splits?.length > 0
}

function toggleExpanded(id) {
  expandedIds.value = { ...expandedIds.value, [id]: !expandedIds.value[id] }
}

function isExpanded(id) {
  return !!expandedIds.value[id]
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
        v-for="tx in transactions"
        :key="tx.id"
        class="border border-hairline rounded-notion p-3 space-y-2"
        :class="isSelected(tx.id) ? 'bg-primary/5 border-primary/30' : ''"
      >
        <div class="flex items-start gap-2">
          <input
            v-if="selectable && !compact"
            type="checkbox"
            :checked="isSelected(tx.id)"
            class="mt-0.5 rounded border-hairline text-primary focus:ring-primary/30"
            @change="$emit('toggle-select', tx.id)"
          />
          <div class="flex-1 min-w-0 space-y-2">
            <template v-if="hasSplits(tx)">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm text-charcoal">{{ format(parseISO(tx.date), 'MMM d, yyyy') }}</span>
                <button
                  class="flex items-center gap-1 text-sm text-charcoal hover:text-primary px-2 py-1.5 min-h-[36px]"
                  @click="toggleExpanded(tx.id)"
                >
                  <FeatherIcon :name="isExpanded(tx.id) ? 'chevron-down' : 'chevron-right'" :size="14" />
                  <span>{{ tx.splits.length }} splits</span>
                </button>
              </div>
              <p v-if="!compact" class="text-sm text-steel">{{ tx.description || '—' }}</p>
              <p
                class="text-sm font-medium"
                :class="tx.type === 'income' ? 'text-success' : 'text-error'"
              >
                {{ tx.type === 'income' ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
              </p>
              <div v-if="isExpanded(tx.id)" class="pl-2 space-y-1 border-t border-hairline pt-2">
                <div
                  v-for="(split, idx) in tx.splits"
                  :key="idx"
                  class="flex items-center justify-between text-sm"
                >
                  <NotionBadge
                    v-if="getCategory(split.category_id)"
                    :label="getCategory(split.category_id).name"
                    :color="getCategory(split.category_id).color"
                  />
                  <span v-else class="text-steel">Unknown</span>
                  <span class="text-charcoal">{{ formatCurrency(split.amount) }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm text-charcoal">{{ format(parseISO(tx.date), 'MMM d, yyyy') }}</span>
                <NotionBadge
                  v-if="getCategory(tx.category_id)"
                  :label="getCategory(tx.category_id).name"
                  :color="getCategory(tx.category_id).color"
                />
              </div>
              <p v-if="!compact" class="text-sm text-steel">{{ tx.description || '—' }}</p>
              <p
                class="text-sm font-medium"
                :class="tx.type === 'income' ? 'text-success' : 'text-error'"
              >
                {{ tx.type === 'income' ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
              </p>
            </template>
            <div v-if="!compact" class="flex gap-2 pt-1">
              <button
                class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary"
                @click="$emit('edit', tx)"
              >
                Edit
              </button>
              <button
                class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error"
                @click="$emit('delete', tx.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!transactions.length" class="py-8 text-center text-sm text-steel">
        No transactions yet
      </p>
    </div>

    <!-- Desktop table -->
    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hidden md:block">
      <table class="w-full hidden md:table">
        <thead>
          <tr class="text-xs text-steel border-b border-hairline">
            <th v-if="selectable && !compact" class="py-2 px-2 w-10">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                class="rounded border-hairline text-primary focus:ring-primary/30"
                title="Select all"
                @change="$emit('toggle-select-all')"
              />
            </th>
            <th class="py-2 px-3 text-left font-medium">Date</th>
            <th class="py-2 px-3 text-left font-medium">Category</th>
            <th v-if="!compact" class="py-2 px-3 text-left font-medium">Description</th>
            <th class="py-2 px-3 text-right font-medium">Amount</th>
            <th v-if="!compact" class="py-2 px-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <TransactionRow
            v-for="tx in transactions"
            :key="tx.id"
            :transaction="tx"
            :compact="compact"
            :selectable="selectable && !compact"
            :selected="isSelected(tx.id)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @toggle-select="$emit('toggle-select', $event)"
          />
          <tr v-if="!transactions.length">
            <td :colspan="compact ? 3 : (selectable ? 6 : 5)" class="py-8 text-center text-sm text-steel">
              No transactions yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
