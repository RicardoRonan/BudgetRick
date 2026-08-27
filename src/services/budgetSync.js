const MONTHLY_MULTIPLIER = {
  weekly: 52 / 12,
  biweekly: 26 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

export function toMonthlyAmount(item) {
  const multiplier = MONTHLY_MULTIPLIER[item.frequency] ?? 1
  return roundMoney(Number(item.amount) * multiplier)
}

export function computeBudgetLimitsFromRecurring(recurring) {
  const limits = {}

  for (const item of recurring) {
    if (!item.is_active) continue
    const categoryId = item.category_id
    limits[categoryId] = roundMoney((limits[categoryId] || 0) + toMonthlyAmount(item))
  }

  return limits
}

export async function syncBudgetLimitsFromRecurring(recurring, categories, updateCategory) {
  const limits = computeBudgetLimitsFromRecurring(recurring)
  let updated = 0

  for (const [categoryId, limit] of Object.entries(limits)) {
    const category = categories.find((entry) => entry.id === categoryId)
    if (!category) continue
    if (roundMoney(category.budget_limit) === limit) continue
    await updateCategory(categoryId, { budget_limit: limit })
    updated++
  }

  return { updated, limits }
}

export async function alignBudgetWithRecurring({
  recurring,
  categories,
  transactions,
  updateCategory,
  deleteTransactions,
  clearAutoTransactions = true,
}) {
  const budgetResult = await syncBudgetLimitsFromRecurring(recurring, categories, updateCategory)

  let transactionsRemoved = 0
  if (clearAutoTransactions) {
    const autoIds = transactions.filter((transaction) => transaction.is_recurring).map((transaction) => transaction.id)
    if (autoIds.length) {
      await deleteTransactions(autoIds)
      transactionsRemoved = autoIds.length
    }
  }

  return {
    categoriesUpdated: budgetResult.updated,
    transactionsRemoved,
    limits: budgetResult.limits,
  }
}
