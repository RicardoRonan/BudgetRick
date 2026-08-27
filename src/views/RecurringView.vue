<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import RecurringList from '../components/recurring/RecurringList.vue'
import RecurringForm from '../components/recurring/RecurringForm.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import NotionModal from '../components/ui/NotionModal.vue'
import NotionSelect from '../components/ui/NotionSelect.vue'
import BulkActionBar from '../components/ui/BulkActionBar.vue'
import { useRecurringStore } from '../stores/recurring.js'
import { useCategoriesStore } from '../stores/categories.js'
import { useListSelection } from '../composables/useListSelection.js'
import { useConfirm } from '../composables/useConfirm.js'

const recurringStore = useRecurringStore()
const categoriesStore = useCategoriesStore()
const { confirm } = useConfirm()
const { recurring } = storeToRefs(recurringStore)

const selection = useListSelection(recurring)

const showForm = ref(false)
const editingItem = ref(null)
const showChangeCategory = ref(false)
const bulkCategoryId = ref('')

const categoryOptions = computed(() =>
  categoriesStore.categories
    .filter((c) => c.is_active && c.type === 'expense')
    .map((c) => ({ value: c.id, label: c.name }))
)

function openAdd() {
  editingItem.value = null
  showForm.value = true
}

function openEdit(item) {
  editingItem.value = item
  showForm.value = true
}

async function handleSave(data) {
  if (editingItem.value) {
    await recurringStore.updateRecurring(editingItem.value.id, data)
  } else {
    await recurringStore.createRecurring(data)
  }
}

async function handleDelete(id) {
  const confirmed = await confirm({
    title: 'Delete recurring bill',
    message: 'Delete this recurring bill? This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (confirmed) {
    await recurringStore.deleteRecurring(id)
    if (selection.isSelected(id)) selection.toggle(id)
  }
}

async function handleToggle(item) {
  await recurringStore.updateRecurring(item.id, { is_active: !item.is_active })
}

async function bulkDelete() {
  const count = selection.selectedCount.value
  const confirmed = await confirm({
    title: 'Delete recurring bills',
    message: `Delete ${count} recurring bill${count === 1 ? '' : 's'}? This cannot be undone.`,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (!confirmed) return
  await recurringStore.deleteRecurringMany(selection.selectedIds.value)
  selection.clear()
}

async function bulkActivate() {
  await recurringStore.updateRecurringMany(selection.selectedIds.value, { is_active: true })
  selection.clear()
}

async function bulkDeactivate() {
  await recurringStore.updateRecurringMany(selection.selectedIds.value, { is_active: false })
  selection.clear()
}

function openChangeCategory() {
  bulkCategoryId.value = categoryOptions.value[0]?.value || ''
  showChangeCategory.value = true
}

async function applyChangeCategory() {
  if (!bulkCategoryId.value) return
  await recurringStore.updateRecurringMany(selection.selectedIds.value, {
    category_id: bulkCategoryId.value,
  })
  showChangeCategory.value = false
  selection.clear()
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold text-charcoal">Recurring Bills</h1>
        <p class="text-sm text-steel mt-0.5">Track subscriptions and regular expenses</p>
      </div>
      <NotionButton class="w-full sm:w-auto shrink-0" @click="openAdd">+ Add Recurring</NotionButton>
    </div>

    <BulkActionBar :count="selection.selectedCount.value" @clear="selection.clear()">
      <NotionButton size="sm" variant="secondary" @click="bulkActivate">Activate</NotionButton>
      <NotionButton size="sm" variant="secondary" @click="bulkDeactivate">Deactivate</NotionButton>
      <NotionButton size="sm" variant="secondary" @click="openChangeCategory">Change category</NotionButton>
      <NotionButton size="sm" variant="danger" @click="bulkDelete">Delete selected</NotionButton>
    </BulkActionBar>

    <RecurringList
      :items="recurring"
      selectable
      :selected-ids="selection.selectedIds.value"
      :all-selected="selection.allSelected.value"
      :some-selected="selection.someSelected.value"
      @edit="openEdit"
      @delete="handleDelete"
      @toggle="handleToggle"
      @toggle-select="selection.toggle"
      @toggle-select-all="selection.toggleAll"
    />

    <RecurringForm v-model="showForm" :item="editingItem" @save="handleSave" />

    <NotionModal v-model="showChangeCategory" title="Change category">
      <form class="space-y-4" @submit.prevent="applyChangeCategory">
        <p class="text-sm text-steel">
          Assign {{ selection.selectedCount.value }} bill{{ selection.selectedCount.value === 1 ? '' : 's' }} to a new category.
        </p>
        <NotionSelect v-model="bulkCategoryId" label="Category" :options="categoryOptions" />
        <div class="flex justify-end gap-2">
          <NotionButton variant="secondary" type="button" @click="showChangeCategory = false">Cancel</NotionButton>
          <NotionButton type="submit">Apply</NotionButton>
        </div>
      </form>
    </NotionModal>
  </div>
</template>
