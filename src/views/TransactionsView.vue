<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import TransactionList from '../components/transactions/TransactionList.vue'
import TransactionForm from '../components/transactions/TransactionForm.vue'
import CategoryFilter from '../components/transactions/CategoryFilter.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionModal from '../components/ui/NotionModal.vue'
import NotionSelect from '../components/ui/NotionSelect.vue'
import NotionTabs from '../components/ui/NotionTabs.vue'
import BulkActionBar from '../components/ui/BulkActionBar.vue'
import { useTransactionsStore } from '../stores/transactions.js'
import { useCategoriesStore } from '../stores/categories.js'
import { useTransactions } from '../composables/useTransactions.js'
import { useListSelection } from '../composables/useListSelection.js'
import { exportToCsv, downloadCsv } from '../services/dataService.js'
import { useConfirm } from '../composables/useConfirm.js'

const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()
const { confirm } = useConfirm()
const { transactions } = storeToRefs(transactionsStore)

const {
  searchQuery,
  typeFilter,
  categoryFilter,
  dateFrom,
  dateTo,
  filtered,
  resetFilters,
} = useTransactions(transactions)

const selection = useListSelection(filtered)

const showForm = ref(false)
const editingTransaction = ref(null)
const showRecategorize = ref(false)
const bulkCategoryId = ref('')

const categoryOptions = computed(() => {
  const type = typeFilter.value === 'all' ? null : typeFilter.value
  return categoriesStore.categories
    .filter((c) => c.is_active && (!type || c.type === type))
    .map((c) => ({ value: c.id, label: c.name }))
})

function openAdd() {
  editingTransaction.value = null
  showForm.value = true
}

function openEdit(tx) {
  editingTransaction.value = tx
  showForm.value = true
}

async function handleSave(data) {
  if (editingTransaction.value) {
    await transactionsStore.updateTransaction(editingTransaction.value.id, data)
  } else {
    await transactionsStore.createTransaction(data)
  }
}

async function handleDelete(id) {
  const confirmed = await confirm({
    title: 'Delete transaction',
    message: 'Delete this transaction? This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (confirmed) {
    await transactionsStore.deleteTransaction(id)
    if (selection.isSelected(id)) selection.toggle(id)
  }
}

function exportCsv(rows = filtered.value) {
  const columns = ['date', 'type', 'amount', 'category_id', 'description']
  const csv = exportToCsv(rows, columns)
  downloadCsv(csv, 'budgetrick-transactions.csv')
}

async function bulkDelete() {
  const count = selection.selectedCount.value
  const confirmed = await confirm({
    title: 'Delete transactions',
    message: `Delete ${count} transaction${count === 1 ? '' : 's'}? This cannot be undone.`,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (!confirmed) return
  await transactionsStore.deleteTransactions(selection.selectedIds.value)
  selection.clear()
}

function bulkExport() {
  exportCsv(selection.selectedItems())
  selection.clear()
}

function openRecategorize() {
  bulkCategoryId.value = categoryOptions.value[0]?.value || ''
  showRecategorize.value = true
}

async function applyRecategorize() {
  if (!bulkCategoryId.value) return
  await transactionsStore.updateTransactions(selection.selectedIds.value, {
    category_id: bulkCategoryId.value,
    splits: [],
  })
  showRecategorize.value = false
  selection.clear()
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold text-charcoal">Transactions</h1>
        <p class="text-sm text-steel mt-0.5">{{ filtered.length }} records</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
        <NotionButton variant="secondary" class="w-full sm:w-auto" @click="exportCsv()">Export CSV</NotionButton>
        <NotionButton class="w-full sm:w-auto" @click="openAdd">+ Add Transaction</NotionButton>
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <NotionInput v-model="searchQuery" placeholder="Search..." class="w-48" />
      <NotionTabs
        v-model="typeFilter"
        :tabs="[
          { value: 'all', label: 'All' },
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]"
      />
      <CategoryFilter v-model="categoryFilter" :type="typeFilter === 'all' ? 'all' : typeFilter" />
      <NotionInput v-model="dateFrom" type="date" label="From" />
      <NotionInput v-model="dateTo" type="date" label="To" />
      <NotionButton variant="ghost" size="sm" @click="resetFilters">Reset</NotionButton>
    </div>

    <BulkActionBar :count="selection.selectedCount.value" @clear="selection.clear()">
      <NotionButton size="sm" variant="secondary" @click="bulkExport">Export selected</NotionButton>
      <NotionButton size="sm" variant="secondary" @click="openRecategorize">Change category</NotionButton>
      <NotionButton size="sm" variant="danger" @click="bulkDelete">Delete selected</NotionButton>
    </BulkActionBar>

    <TransactionList
      :transactions="filtered"
      selectable
      :selected-ids="selection.selectedIds.value"
      :all-selected="selection.allSelected.value"
      :some-selected="selection.someSelected.value"
      @edit="openEdit"
      @delete="handleDelete"
      @toggle-select="selection.toggle"
      @toggle-select-all="selection.toggleAll"
    />

    <TransactionForm
      v-model="showForm"
      :transaction="editingTransaction"
      @save="handleSave"
    />

    <NotionModal v-model="showRecategorize" title="Change category">
      <form class="space-y-4" @submit.prevent="applyRecategorize">
        <p class="text-sm text-steel">
          Assign {{ selection.selectedCount.value }} transaction{{ selection.selectedCount.value === 1 ? '' : 's' }} to a new category.
        </p>
        <NotionSelect
          v-model="bulkCategoryId"
          label="Category"
          :options="categoryOptions"
        />
        <div class="flex justify-end gap-2">
          <NotionButton variant="secondary" type="button" @click="showRecategorize = false">Cancel</NotionButton>
          <NotionButton type="submit">Apply</NotionButton>
        </div>
      </form>
    </NotionModal>
  </div>
</template>
