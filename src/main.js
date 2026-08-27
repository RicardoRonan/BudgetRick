import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initSupabase } from './composables/useSupabase.js'
import { alignBudgetWithRecurring } from './services/budgetSync.js'
import { refreshAppData } from './services/refreshAppData.js'
import { useAuthStore } from './stores/auth.js'
import { useCategoriesStore } from './stores/categories.js'
import { useTransactionsStore } from './stores/transactions.js'
import { useRecurringStore } from './stores/recurring.js'
import './assets/styles/main.css'

async function bootstrap() {
  await initSupabase()

  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const authStore = useAuthStore()
  await authStore.init()

  if (authStore.isLoggedIn || !authStore.isConfigured) {
    await refreshAppData()

    const categoriesStore = useCategoriesStore()
    const transactionsStore = useTransactionsStore()
    const recurringStore = useRecurringStore()

    const alignmentKey = 'br_budget_recurring_aligned_v1'
    const needsAlignment =
      !localStorage.getItem(alignmentKey) &&
      (recurringStore.recurring.length > 0 ||
        transactionsStore.transactions.some((transaction) => transaction.is_recurring))

    if (needsAlignment) {
      await alignBudgetWithRecurring({
        recurring: recurringStore.recurring,
        categories: categoriesStore.categories,
        transactions: transactionsStore.transactions,
        updateCategory: (id, data) => categoriesStore.updateCategory(id, data),
        deleteTransactions: (ids) => transactionsStore.deleteTransactions(ids),
      })
      localStorage.setItem(alignmentKey, '1')
    }
  }

  app.mount('#app')

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
}

bootstrap()
