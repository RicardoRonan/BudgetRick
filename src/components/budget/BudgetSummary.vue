<script setup>
import { useCurrency } from '../../composables/useCurrency.js'

defineProps({
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  savingsRate: { type: Number, default: 0 },
})

const { formatCurrency } = useCurrency()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    <div class="bg-canvas border border-hairline rounded-notion-lg p-3 sm:p-4 min-w-0">
      <p class="text-xs font-medium text-steel uppercase tracking-wide">Total Income</p>
      <p class="text-xl sm:text-2xl font-bold text-success mt-1 truncate">{{ formatCurrency(income) }}</p>
    </div>
    <div class="bg-canvas border border-hairline rounded-notion-lg p-3 sm:p-4 min-w-0">
      <p class="text-xs font-medium text-steel uppercase tracking-wide">Total Expenses</p>
      <p class="text-xl sm:text-2xl font-bold text-error mt-1 truncate">{{ formatCurrency(expenses) }}</p>
    </div>
    <div class="bg-canvas border border-hairline rounded-notion-lg p-3 sm:p-4 min-w-0">
      <p class="text-xs font-medium text-steel uppercase tracking-wide">Remaining</p>
      <p class="text-xl sm:text-2xl font-bold mt-1 truncate" :class="remaining >= 0 ? 'text-charcoal' : 'text-error'">
        {{ formatCurrency(remaining) }}
      </p>
    </div>
    <div class="bg-canvas border border-hairline rounded-notion-lg p-3 sm:p-4 min-w-0">
      <p class="text-xs font-medium text-steel uppercase tracking-wide">Savings Rate</p>
      <p class="text-xl sm:text-2xl font-bold text-primary mt-1">{{ savingsRate }}%</p>
    </div>
  </div>
</template>
