import { computed } from 'vue'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, subMonths } from 'date-fns'

export function useBudget(transactions, categories, selectedMonth) {
  const monthStart = computed(() => startOfMonth(selectedMonth.value))
  const monthEnd = computed(() => endOfMonth(selectedMonth.value))
  const prevMonthStart = computed(() => startOfMonth(subMonths(selectedMonth.value, 1)))
  const prevMonthEnd = computed(() => endOfMonth(subMonths(selectedMonth.value, 1)))

  const monthTransactions = computed(() => {
    return transactions.value.filter((t) => {
      const date = parseISO(t.date)
      return isWithinInterval(date, { start: monthStart.value, end: monthEnd.value })
    })
  })

  const prevMonthTransactions = computed(() => {
    return transactions.value.filter((t) => {
      const date = parseISO(t.date)
      return isWithinInterval(date, { start: prevMonthStart.value, end: prevMonthEnd.value })
    })
  })

  const incomeCategories = computed(() =>
    categories.value
      .filter((c) => c.type === 'income' && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  )

  const expenseCategories = computed(() =>
    categories.value
      .filter((c) => c.type === 'expense' && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
  )

  function getSplitAmountForCategory(transaction, categoryId) {
    if (!transaction.splits?.length) return 0
    return transaction.splits
      .filter((s) => s.category_id === categoryId)
      .reduce((sum, s) => sum + Number(s.amount), 0)
  }

  function getCategoryTotal(categoryId, type, txList) {
    let total = 0
    for (const t of txList) {
      if (t.type !== type) continue
      if (t.splits?.length) {
        total += getSplitAmountForCategory(t, categoryId)
      } else if (t.category_id === categoryId) {
        total += Number(t.amount)
      }
    }
    return total
  }

  const rolloverAmounts = computed(() => {
    const map = {}
    for (const cat of categories.value) {
      if (!cat.rollover) continue
      const budgeted = Number(cat.budget_limit) || 0
      const actual = getCategoryTotal(cat.id, cat.type, prevMonthTransactions.value)
      const remaining = budgeted - actual
      if (remaining > 0) {
        map[cat.id] = remaining
      }
    }
    return map
  })

  const incomeRows = computed(() =>
    incomeCategories.value.map((cat) => {
      const actual = getCategoryTotal(cat.id, 'income', monthTransactions.value)
      const baseBudgeted = Number(cat.budget_limit) || 0
      const rollover = cat.rollover ? (rolloverAmounts.value[cat.id] || 0) : 0
      const budgeted = baseBudgeted + rollover
      return {
        category: cat,
        budgeted,
        baseBudgeted,
        rollover,
        actual,
        remaining: budgeted - actual,
      }
    })
  )

  const expenseRows = computed(() =>
    expenseCategories.value.map((cat) => {
      const actual = getCategoryTotal(cat.id, 'expense', monthTransactions.value)
      const baseBudgeted = Number(cat.budget_limit) || 0
      const rollover = cat.rollover ? (rolloverAmounts.value[cat.id] || 0) : 0
      const budgeted = baseBudgeted + rollover
      return {
        category: cat,
        budgeted,
        baseBudgeted,
        rollover,
        actual,
        remaining: budgeted - actual,
      }
    })
  )

  const totalIncome = computed(() =>
    monthTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const totalExpenses = computed(() =>
    monthTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const remaining = computed(() => totalIncome.value - totalExpenses.value)

  const savingsRate = computed(() => {
    if (totalIncome.value === 0) return 0
    return Math.round((remaining.value / totalIncome.value) * 100)
  })

  const spendingByCategory = computed(() => {
    const map = {}
    monthTransactions.value
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        if (t.splits?.length) {
          t.splits.forEach((split) => {
            const cat = categories.value.find((c) => c.id === split.category_id)
            const name = cat?.name || 'Unknown'
            map[name] = (map[name] || 0) + Number(split.amount)
          })
        } else {
          const cat = categories.value.find((c) => c.id === t.category_id)
          const name = cat?.name || 'Unknown'
          map[name] = (map[name] || 0) + Number(t.amount)
        }
      })
    return Object.entries(map).map(([name, amount]) => ({ name, amount }))
  })

  function getBudgetStatus(remainingAmount, budgeted) {
    if (budgeted === 0) return 'neutral'
    const ratio = remainingAmount / budgeted
    if (ratio < 0) return 'over'
    if (ratio < 0.1) return 'warning'
    return 'under'
  }

  return {
    monthTransactions,
    incomeRows,
    expenseRows,
    rolloverAmounts,
    totalIncome,
    totalExpenses,
    remaining,
    savingsRate,
    spendingByCategory,
    getBudgetStatus,
    monthLabel: computed(() => format(selectedMonth.value, 'MMMM yyyy')),
  }
}
