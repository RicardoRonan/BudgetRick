<script setup>
import { ref } from 'vue'
import { format, parseISO } from 'date-fns'
import NotionBadge from '../ui/NotionBadge.vue'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { useCategoriesStore } from '../../stores/categories.js'
import { useCurrency } from '../../composables/useCurrency.js'

const props = defineProps({
  transaction: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete', 'toggle-select'])

const categoriesStore = useCategoriesStore()
const { formatCurrency } = useCurrency()
const expanded = ref(false)

function getCategory(id) {
  return categoriesStore.getCategoryById(id)
}

function hasSplits(tx) {
  return tx.splits?.length > 0
}
</script>

<template>
  <template v-if="hasSplits(transaction)">
    <tr
      class="border-b border-hairline transition-colors"
      :class="selected ? 'bg-primary/5' : 'hover:bg-surface/50'"
    >
      <td v-if="selectable && !compact" class="py-2.5 px-2 w-10">
        <input
          type="checkbox"
          :checked="selected"
          class="rounded border-hairline text-primary focus:ring-primary/30"
          @change="$emit('toggle-select', transaction.id)"
        />
      </td>
      <td class="py-2.5 px-3 text-sm text-charcoal">
        {{ format(parseISO(transaction.date), 'MMM d, yyyy') }}
      </td>
      <td class="py-2.5 px-3">
        <button
          class="flex items-center gap-1 text-sm text-charcoal hover:text-primary"
          @click="expanded = !expanded"
        >
          <FeatherIcon :name="expanded ? 'chevron-down' : 'chevron-right'" :size="14" />
          <span>{{ transaction.splits.length }} splits</span>
        </button>
      </td>
      <td v-if="!compact" class="py-2.5 px-3 text-sm text-steel">{{ transaction.description || '—' }}</td>
      <td
        class="py-2.5 px-3 text-sm text-right font-medium"
        :class="transaction.type === 'income' ? 'text-success' : 'text-error'"
      >
        {{ transaction.type === 'income' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
      </td>
      <td v-if="!compact" class="py-2.5 px-3 text-right">
        <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary mr-2" @click="$emit('edit', transaction)">
          Edit
        </button>
        <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="$emit('delete', transaction.id)">
          Delete
        </button>
      </td>
    </tr>
    <tr v-if="expanded" class="bg-surface/30">
      <td :colspan="compact ? 3 : (selectable ? 6 : 5)" class="py-2 px-3">
        <div class="pl-6 space-y-1">
          <div
            v-for="(split, idx) in transaction.splits"
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
      </td>
    </tr>
  </template>
  <tr
    v-else
    class="border-b border-hairline transition-colors"
    :class="selected ? 'bg-primary/5' : 'hover:bg-surface/50'"
  >
    <td v-if="selectable && !compact" class="py-2.5 px-2 w-10">
      <input
        type="checkbox"
        :checked="selected"
        class="rounded border-hairline text-primary focus:ring-primary/30"
        @change="$emit('toggle-select', transaction.id)"
      />
    </td>
    <td class="py-2.5 px-3 text-sm text-charcoal">
      {{ format(parseISO(transaction.date), 'MMM d, yyyy') }}
    </td>
    <td class="py-2.5 px-3">
      <NotionBadge
        v-if="getCategory(transaction.category_id)"
        :label="getCategory(transaction.category_id).name"
        :color="getCategory(transaction.category_id).color"
      />
    </td>
    <td v-if="!compact" class="py-2.5 px-3 text-sm text-steel">{{ transaction.description || '—' }}</td>
    <td
      class="py-2.5 px-3 text-sm text-right font-medium"
      :class="transaction.type === 'income' ? 'text-success' : 'text-error'"
    >
      {{ transaction.type === 'income' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
    </td>
    <td v-if="!compact" class="py-2.5 px-3 text-right">
      <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary mr-2" @click="$emit('edit', transaction)">
        Edit
      </button>
      <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="$emit('delete', transaction.id)">
        Delete
      </button>
    </td>
  </tr>
</template>
