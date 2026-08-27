<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import NotionCard from '../components/ui/NotionCard.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import NotionTabs from '../components/ui/NotionTabs.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionSelect from '../components/ui/NotionSelect.vue'
import NotionModal from '../components/ui/NotionModal.vue'
import BulkActionBar from '../components/ui/BulkActionBar.vue'
import FeatherIcon from '../components/ui/FeatherIcon.vue'
import { useUiStore } from '../stores/ui.js'
import { useCategoriesStore } from '../stores/categories.js'
import { useCategoryDelete } from '../composables/useCategoryDelete.js'
import { useListSelection } from '../composables/useListSelection.js'
import { useConfirm } from '../composables/useConfirm.js'
import { CURRENCIES } from '../composables/useCurrency.js'
import { exportAllData, exportToCsv, downloadCsv } from '../services/dataService.js'
import { alignBudgetWithRecurring } from '../services/budgetSync.js'
import { categoryTints } from '../design/colors.js'
import { iconSelectOptions } from '../design/icons.js'
import ImportNotion from '../components/settings/ImportNotion.vue'
import AccountSettings from '../components/settings/AccountSettings.vue'
import { useTransactionsStore } from '../stores/transactions.js'
import { useRecurringStore } from '../stores/recurring.js'
import { useAuthStore } from '../stores/auth.js'

const uiStore = useUiStore()
const categoriesStore = useCategoriesStore()
const transactionsStore = useTransactionsStore()
const recurringStore = useRecurringStore()
const authStore = useAuthStore()
const { categories } = storeToRefs(categoriesStore)
const { confirmDelete, confirmBulkDelete } = useCategoryDelete()
const { confirm } = useConfirm()

const activeIncome = computed(() => categories.value.filter((c) => c.type === 'income' && c.is_active))
const activeExpense = computed(() => categories.value.filter((c) => c.type === 'expense' && c.is_active))
const hiddenCategories = computed(() => categories.value.filter((c) => !c.is_active))
const incomeSelection = useListSelection(activeIncome)
const expenseSelection = useListSelection(activeExpense)
const hiddenSelection = useListSelection(hiddenCategories)

const showCategoryForm = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
  name: '',
  type: 'expense',
  color: categoryTints[0],
  icon: 'package',
  budget_limit: 0,
  rollover: false,
})

const iconOptions = iconSelectOptions()

function openAddCategory() {
  editingCategory.value = null
  categoryForm.value = { name: '', type: 'expense', color: categoryTints[0], icon: 'package', budget_limit: 0, rollover: false }
  showCategoryForm.value = true
}

function openEditCategory(cat) {
  editingCategory.value = cat
  categoryForm.value = {
    name: cat.name,
    type: cat.type,
    color: cat.color,
    icon: cat.icon,
    budget_limit: cat.budget_limit,
    rollover: cat.rollover ?? false,
  }
  showCategoryForm.value = true
}

async function saveCategory() {
  if (!categoryForm.value.name) return
  if (editingCategory.value) {
    await categoriesStore.updateCategory(editingCategory.value.id, categoryForm.value)
  } else {
    await categoriesStore.createCategory(categoryForm.value)
  }
  showCategoryForm.value = false
}

async function deleteCategory(id, name) {
  await confirmDelete(id, name)
}

async function restoreCategory(id) {
  await categoriesStore.updateCategory(id, { is_active: true })
}

async function bulkHide(ids, selection) {
  if (!ids.length) return
  const confirmed = await confirm({
    title: 'Hide categories',
    message: `Hide ${ids.length} categor${ids.length === 1 ? 'y' : 'ies'} from your budget?`,
    confirmLabel: 'Hide',
    cancelLabel: 'Cancel',
    variant: 'primary',
  })
  if (!confirmed) return
  await Promise.all(ids.map((id) => categoriesStore.updateCategory(id, { is_active: false })))
  selection.clear()
}

async function bulkRestore(ids, selection) {
  if (!ids.length) return
  await Promise.all(ids.map((id) => categoriesStore.updateCategory(id, { is_active: true })))
  selection.clear()
}

async function bulkDeleteIds(ids, selection) {
  if (!ids.length) return
  const ok = await confirmBulkDelete(ids)
  if (ok) selection.clear()
}

function exportTransactions() {
  const data = exportAllData()
  const csv = exportToCsv(data.transactions, ['date', 'type', 'amount', 'category_id', 'description'])
  downloadCsv(csv, 'budgetrick-all-transactions.csv')
}

function exportAll() {
  const data = exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'budgetrick-backup.json'
  link.click()
  URL.revokeObjectURL(url)
}

const typeOptions = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const themeTabs = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const currencyOptions = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.symbol} ${c.label}`,
}))

const budgetSyncing = ref(false)
const budgetSyncMessage = ref('')

async function syncBudgetWithRecurring() {
  budgetSyncing.value = true
  budgetSyncMessage.value = ''

  try {
    const result = await alignBudgetWithRecurring({
      recurring: recurringStore.recurring,
      categories: categoriesStore.categories,
      transactions: transactionsStore.transactions,
      updateCategory: (id, data) => categoriesStore.updateCategory(id, data),
      deleteTransactions: (ids) => transactionsStore.deleteTransactions(ids),
    })

    const parts = []
    if (result.categoriesUpdated) {
      parts.push(`updated ${result.categoriesUpdated} budget limit${result.categoriesUpdated === 1 ? '' : 's'}`)
    }
    if (result.transactionsRemoved) {
      parts.push(`removed ${result.transactionsRemoved} auto-posted transaction${result.transactionsRemoved === 1 ? '' : 's'}`)
    }
    budgetSyncMessage.value = parts.length
      ? `Budget aligned: ${parts.join(', ')}.`
      : 'Budget already matches your recurring bills.'
  } catch (err) {
    budgetSyncMessage.value = err.message || 'Could not sync budget'
  } finally {
    budgetSyncing.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-bold text-charcoal">Settings</h1>
      <p class="text-sm text-steel mt-0.5">Customize your budget app</p>
    </div>

    <NotionCard v-if="authStore.isConfigured && authStore.isLoggedIn">
      <h2 class="text-sm font-semibold text-charcoal mb-4">Account</h2>
      <p class="text-sm text-steel mb-4">Manage your sign-in, email, and password.</p>
      <AccountSettings />
    </NotionCard>

    <NotionCard v-else-if="authStore.isConfigured">
      <h2 class="text-sm font-semibold text-charcoal mb-2">Account</h2>
      <p class="text-sm text-steel mb-4">
        Sign in to sync your budget across devices. Your local data stays on this device until you sign in.
      </p>
      <div class="flex flex-col sm:flex-row gap-2">
        <RouterLink to="/login" class="w-full sm:w-auto">
          <NotionButton class="w-full">Sign in</NotionButton>
        </RouterLink>
        <RouterLink to="/register" class="w-full sm:w-auto">
          <NotionButton variant="secondary" class="w-full">Create account</NotionButton>
        </RouterLink>
      </div>
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">Appearance</h2>
      <div>
        <p class="text-sm text-charcoal mb-3">Theme</p>
        <NotionTabs
          :model-value="uiStore.themePreference"
          :tabs="themeTabs"
          @update:model-value="uiStore.setThemePreference"
        />
        <p class="text-xs text-steel mt-2">
          Currently using {{ uiStore.resolvedTheme }} mode
          <template v-if="uiStore.themePreference === 'system'">
            (following system preference)
          </template>
        </p>
      </div>
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">Currency</h2>
      <NotionSelect
        :model-value="uiStore.currency"
        label="Display currency"
        :options="currencyOptions"
        @update:model-value="uiStore.setCurrency"
      />
      <p class="text-xs text-steel mt-2">All amounts display in this currency</p>
    </NotionCard>

    <NotionCard>
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-sm font-semibold text-charcoal">Categories</h2>
        <NotionButton size="sm" @click="openAddCategory">+ Add Category</NotionButton>
      </div>

      <div class="space-y-4">
        <div>
          <h3 class="text-xs font-medium text-steel uppercase mb-2">Income</h3>
          <BulkActionBar
            v-if="incomeSelection.hasSelection.value"
            class="mb-2"
            :count="incomeSelection.selectedCount.value"
            @clear="incomeSelection.clear()"
          >
            <NotionButton size="sm" variant="secondary" @click="bulkHide(incomeSelection.selectedIds.value, incomeSelection)">Hide selected</NotionButton>
            <NotionButton size="sm" variant="danger" @click="bulkDeleteIds(incomeSelection.selectedIds.value, incomeSelection)">Delete selected</NotionButton>
          </BulkActionBar>
          <div class="space-y-1">
            <div
              v-for="cat in activeIncome"
              :key="cat.id"
              class="flex items-center justify-between py-2 px-3 rounded-notion hover:bg-surface transition-colors"
              :class="incomeSelection.isSelected(cat.id) ? 'bg-primary/5' : ''"
            >
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  :checked="incomeSelection.isSelected(cat.id)"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  @change="incomeSelection.toggle(cat.id)"
                />
                <FeatherIcon :name="cat.icon" :size="16" />
                <span class="text-sm text-charcoal">{{ cat.name }}</span>
              </div>
              <div class="flex gap-2">
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary" @click="openEditCategory(cat)">Edit</button>
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="deleteCategory(cat.id, cat.name)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-medium text-steel uppercase mb-2">Expenses</h3>
          <BulkActionBar
            v-if="expenseSelection.hasSelection.value"
            class="mb-2"
            :count="expenseSelection.selectedCount.value"
            @clear="expenseSelection.clear()"
          >
            <NotionButton size="sm" variant="secondary" @click="bulkHide(expenseSelection.selectedIds.value, expenseSelection)">Hide selected</NotionButton>
            <NotionButton size="sm" variant="danger" @click="bulkDeleteIds(expenseSelection.selectedIds.value, expenseSelection)">Delete selected</NotionButton>
          </BulkActionBar>
          <div class="space-y-1">
            <div
              v-for="cat in activeExpense"
              :key="cat.id"
              class="flex items-center justify-between py-2 px-3 rounded-notion hover:bg-surface transition-colors"
              :class="expenseSelection.isSelected(cat.id) ? 'bg-primary/5' : ''"
            >
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  :checked="expenseSelection.isSelected(cat.id)"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  @change="expenseSelection.toggle(cat.id)"
                />
                <FeatherIcon :name="cat.icon" :size="16" />
                <span class="text-sm text-charcoal">{{ cat.name }}</span>
              </div>
              <div class="flex gap-2">
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-primary" @click="openEditCategory(cat)">Edit</button>
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="deleteCategory(cat.id, cat.name)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hiddenCategories.length">
          <h3 class="text-xs font-medium text-steel uppercase mb-2">Hidden</h3>
          <BulkActionBar
            v-if="hiddenSelection.hasSelection.value"
            class="mb-2"
            :count="hiddenSelection.selectedCount.value"
            @clear="hiddenSelection.clear()"
          >
            <NotionButton size="sm" variant="secondary" @click="bulkRestore(hiddenSelection.selectedIds.value, hiddenSelection)">Restore selected</NotionButton>
            <NotionButton size="sm" variant="danger" @click="bulkDeleteIds(hiddenSelection.selectedIds.value, hiddenSelection)">Delete selected</NotionButton>
          </BulkActionBar>
          <div class="space-y-1">
            <div
              v-for="cat in hiddenCategories"
              :key="cat.id"
              class="flex items-center justify-between py-2 px-3 rounded-notion hover:bg-surface transition-colors"
              :class="hiddenSelection.isSelected(cat.id) ? 'bg-primary/5' : ''"
            >
              <div class="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  :checked="hiddenSelection.isSelected(cat.id)"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  @change="hiddenSelection.toggle(cat.id)"
                />
                <FeatherIcon :name="cat.icon" :size="16" />
                <span class="text-sm text-steel">{{ cat.name }}</span>
                <span class="text-xs text-steel">({{ cat.type }})</span>
              </div>
              <div class="flex gap-2">
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-primary hover:underline" @click="restoreCategory(cat.id)">
                  Restore
                </button>
                <button class="px-2 py-1.5 min-h-[36px] text-xs text-steel hover:text-error" @click="deleteCategory(cat.id, cat.name)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">Budget Sync</h2>
      <p class="text-sm text-steel mb-4">
        Set category budget limits from your recurring bills and remove auto-posted recurring transactions.
      </p>
      <NotionButton variant="secondary" :disabled="budgetSyncing" @click="syncBudgetWithRecurring">
        {{ budgetSyncing ? 'Syncing...' : 'Align budget with recurring' }}
      </NotionButton>
      <p
        v-if="budgetSyncMessage"
        class="text-sm mt-3"
        :class="budgetSyncMessage.startsWith('Budget aligned') || budgetSyncMessage.startsWith('Budget already') ? 'text-success' : 'text-error'"
      >
        {{ budgetSyncMessage }}
      </p>
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">Import from Notion</h2>
      <ImportNotion />
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">Export Data</h2>
      <div class="flex flex-col sm:flex-row gap-2">
        <NotionButton variant="secondary" @click="exportTransactions">Export Transactions (CSV)</NotionButton>
        <NotionButton variant="secondary" @click="exportAll">Export All (JSON)</NotionButton>
      </div>
    </NotionCard>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-2">About BudgetRick</h2>
      <p class="text-sm text-steel">
        A privacy-first budget app with manual entry and category-based budgeting.
        <template v-if="authStore.isConfigured && authStore.isLoggedIn">
          Your data syncs securely to your Supabase account.
        </template>
        <template v-else>
          Your data stays on your device until you sign in to sync.
        </template>
      </p>
    </NotionCard>

    <NotionModal
      v-model="showCategoryForm"
      :title="editingCategory ? 'Edit Category' : 'Add Category'"
    >
      <form class="space-y-4" @submit.prevent="saveCategory">
        <NotionInput v-model="categoryForm.name" label="Name" placeholder="Category name" />
        <NotionSelect v-model="categoryForm.type" label="Type" :options="typeOptions" />
        <NotionSelect v-model="categoryForm.icon" label="Icon" :options="iconOptions" />
        <label class="flex items-center gap-2">
          <input
            v-model="categoryForm.rollover"
            type="checkbox"
            class="rounded border-hairline text-primary focus:ring-primary/30"
          />
          <span class="text-sm text-charcoal">Roll over unused budget to next month</span>
        </label>
        <NotionInput v-model="categoryForm.budget_limit" label="Default Budget Limit" type="number" />
        <div class="flex justify-end gap-2">
          <NotionButton variant="secondary" type="button" @click="showCategoryForm = false">Cancel</NotionButton>
          <NotionButton type="submit">{{ editingCategory ? 'Update' : 'Add' }}</NotionButton>
        </div>
      </form>
    </NotionModal>
  </div>
</template>
