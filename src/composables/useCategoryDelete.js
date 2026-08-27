import { useCategoriesStore } from '../stores/categories.js'
import { useTransactionsStore } from '../stores/transactions.js'
import { useRecurringStore } from '../stores/recurring.js'
import { useConfirm } from './useConfirm.js'

export function useCategoryDelete() {
  const categoriesStore = useCategoriesStore()
  const transactionsStore = useTransactionsStore()
  const recurringStore = useRecurringStore()
  const { confirm } = useConfirm()

  function getUsage(categoryId) {
    let transactionCount = 0
    for (const t of transactionsStore.transactions) {
      if (t.category_id === categoryId) {
        transactionCount++
      } else if (t.splits?.some((s) => s.category_id === categoryId)) {
        transactionCount++
      }
    }
    const recurringCount = recurringStore.recurring.filter((r) => r.category_id === categoryId).length
    return { transactionCount, recurringCount }
  }

  function buildConfirmMessage(name, categoryId) {
    const { transactionCount, recurringCount } = getUsage(categoryId)
    if (transactionCount === 0 && recurringCount === 0) {
      return `Permanently delete "${name}"? This cannot be undone.`
    }
    const parts = []
    if (transactionCount > 0) parts.push(`${transactionCount} transaction(s)`)
    if (recurringCount > 0) parts.push(`${recurringCount} recurring bill(s)`)
    return `"${name}" is used by ${parts.join(' and ')}. Those records will lose their category link. Delete anyway?`
  }

  async function confirmDelete(categoryId, categoryName) {
    const name = categoryName || categoriesStore.getCategoryById(categoryId)?.name || 'this category'
    const confirmed = await confirm({
      title: 'Delete category',
      message: buildConfirmMessage(name, categoryId),
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return false
    await categoriesStore.deleteCategory(categoryId)
    return true
  }

  function buildBulkConfirmMessage(categoryIds) {
    let transactionCount = 0
    let recurringCount = 0
    for (const id of categoryIds) {
      const usage = getUsage(id)
      transactionCount += usage.transactionCount
      recurringCount += usage.recurringCount
    }
    const count = categoryIds.length
    if (transactionCount === 0 && recurringCount === 0) {
      return `Permanently delete ${count} categor${count === 1 ? 'y' : 'ies'}? This cannot be undone.`
    }
    const parts = []
    if (transactionCount > 0) parts.push(`${transactionCount} transaction(s)`)
    if (recurringCount > 0) parts.push(`${recurringCount} recurring bill(s)`)
    return `Delete ${count} categories? Linked ${parts.join(' and ')} will lose their category link. Continue?`
  }

  async function confirmBulkDelete(categoryIds) {
    if (!categoryIds.length) return false
    const confirmed = await confirm({
      title: 'Delete categories',
      message: buildBulkConfirmMessage(categoryIds),
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return false
    await Promise.all(categoryIds.map((id) => categoriesStore.deleteCategory(id)))
    return true
  }

  return { confirmDelete, confirmBulkDelete, getUsage }
}
