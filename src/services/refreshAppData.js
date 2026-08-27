import { useCategoriesStore } from '../stores/categories.js'
import { useTransactionsStore } from '../stores/transactions.js'
import { useGoalsStore } from '../stores/goals.js'
import { useRecurringStore } from '../stores/recurring.js'

export async function refreshAppData() {
  const categoriesStore = useCategoriesStore()
  const transactionsStore = useTransactionsStore()
  const goalsStore = useGoalsStore()
  const recurringStore = useRecurringStore()

  await Promise.all([
    categoriesStore.fetchCategories(),
    transactionsStore.fetchTransactions(),
    goalsStore.fetchGoals(),
    recurringStore.fetchRecurring(),
  ])
}
