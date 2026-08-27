import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useUiStore } from './ui.js'
import { useTransactionsStore } from './transactions.js'
import { useCategoriesStore } from './categories.js'
import { useBudget } from '../composables/useBudget.js'

export const useBudgetStore = defineStore('budget', () => {
  const uiStore = useUiStore()
  const transactionsStore = useTransactionsStore()
  const categoriesStore = useCategoriesStore()

  const transactions = computed(() => transactionsStore.transactions)
  const categories = computed(() => categoriesStore.categories)
  const selectedMonth = computed(() => uiStore.selectedMonth)

  return useBudget(transactions, categories, selectedMonth)
})
