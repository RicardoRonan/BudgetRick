<script setup>
import BudgetTable from '../components/budget/BudgetTable.vue'
import { useBudgetStore } from '../stores/budget.js'
import { useCategoriesStore } from '../stores/categories.js'
import { useCategoryDelete } from '../composables/useCategoryDelete.js'
import { useConfirm } from '../composables/useConfirm.js'
import { categoryTints } from '../design/colors.js'

const budgetStore = useBudgetStore()
const categoriesStore = useCategoriesStore()
const { confirmDelete, confirmBulkDelete } = useCategoryDelete()
const { confirm } = useConfirm()

async function updateBudget(categoryId, value) {
  await categoriesStore.updateCategory(categoryId, { budget_limit: Number(value) || 0 })
}

async function updateName(categoryId, name) {
  await categoriesStore.updateCategory(categoryId, { name })
}

async function updateRollover(categoryId, rollover) {
  await categoriesStore.updateCategory(categoryId, { rollover })
}

async function hideCategory(categoryId) {
  const confirmed = await confirm({
    title: 'Hide category',
    message: 'Hide this category from your budget? You can restore it in Settings.',
    confirmLabel: 'Hide',
    cancelLabel: 'Cancel',
    variant: 'primary',
  })
  if (confirmed) {
    await categoriesStore.updateCategory(categoryId, { is_active: false })
  }
}

async function deleteCategory(categoryId, categoryName) {
  await confirmDelete(categoryId, categoryName)
}

async function bulkHideCategoryIds(ids, selection) {
  if (!ids.length) return
  const confirmed = await confirm({
    title: 'Hide categories',
    message: `Hide ${ids.length} categor${ids.length === 1 ? 'y' : 'ies'} from your budget? You can restore them in Settings.`,
    confirmLabel: 'Hide',
    cancelLabel: 'Cancel',
    variant: 'primary',
  })
  if (!confirmed) return
  await Promise.all(ids.map((id) => categoriesStore.updateCategory(id, { is_active: false })))
  selection.clear()
}

async function bulkDeleteCategoryIds(ids, selection) {
  if (!ids.length) return
  const ok = await confirmBulkDelete(ids)
  if (ok) selection.clear()
}

async function bulkRolloverCategoryIds(ids, rollover, selection) {
  if (!ids.length) return
  await Promise.all(ids.map((id) => categoriesStore.updateCategory(id, { rollover })))
  selection.clear()
}

async function reorderCategories(type, orderedIds) {
  await categoriesStore.reorderCategories(type, orderedIds)
}

async function addCategory(type) {
  const existing = categoriesStore.categories.filter((c) => c.type === type)
  const tintIndex = existing.length % categoryTints.length
  await categoriesStore.createCategory({
    name: type === 'income' ? 'New Income' : 'New Expense',
    type,
    color: categoryTints[tintIndex],
    icon: type === 'income' ? 'dollar-sign' : 'package',
    budget_limit: 0,
    rollover: false,
  })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-charcoal">Monthly Budget</h1>
      <p class="text-sm text-steel mt-0.5">{{ budgetStore.monthLabel }}</p>
    </div>

    <BudgetTable
      :income-rows="budgetStore.incomeRows"
      :expense-rows="budgetStore.expenseRows"
      :total-income="budgetStore.totalIncome"
      :total-expenses="budgetStore.totalExpenses"
      :remaining="budgetStore.remaining"
      @update-budget="updateBudget"
      @update-name="updateName"
      @update-rollover="updateRollover"
      @hide="hideCategory"
      @delete="deleteCategory"
      @bulk-hide="bulkHideCategoryIds"
      @bulk-delete="bulkDeleteCategoryIds"
      @bulk-rollover="bulkRolloverCategoryIds"
      @reorder="reorderCategories"
      @add-category="addCategory"
    />
  </div>
</template>
