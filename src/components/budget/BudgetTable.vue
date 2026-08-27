<script setup>
import { ref, computed } from 'vue'
import BudgetRow from './BudgetRow.vue'
import NotionButton from '../ui/NotionButton.vue'
import BulkActionBar from '../ui/BulkActionBar.vue'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { useCurrency } from '../../composables/useCurrency.js'
import { useListSelection } from '../../composables/useListSelection.js'

const props = defineProps({
  incomeRows: { type: Array, default: () => [] },
  expenseRows: { type: Array, default: () => [] },
  totalIncome: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
})

const emit = defineEmits([
  'update-budget',
  'update-name',
  'update-rollover',
  'hide',
  'delete',
  'bulk-hide',
  'bulk-delete',
  'bulk-rollover',
  'reorder',
  'add-category',
])

const { formatCurrency } = useCurrency()

const incomeSelection = useListSelection(
  computed(() => props.incomeRows),
  (row) => row.category.id,
)
const expenseSelection = useListSelection(
  computed(() => props.expenseRows),
  (row) => row.category.id,
)

const dragId = ref(null)
const dragOverId = ref(null)
const editingId = ref(null)
const nameDraft = ref('')

function statusClass(remaining, budgeted) {
  if (budgeted === 0) return ''
  const ratio = remaining / budgeted
  if (ratio < 0) return 'text-error'
  if (ratio < 0.1) return 'text-warning'
  return 'text-success'
}

function startNameEdit(row) {
  editingId.value = row.category.id
  nameDraft.value = row.category.name
}

function saveName(row) {
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== row.category.name) {
    emit('update-name', row.category.id, trimmed)
  }
  editingId.value = null
}

function handleDragStart(id) {
  dragId.value = id
}

function handleDragOver(id) {
  dragOverId.value = id
}

function handleDrop(type, targetId) {
  if (!dragId.value || dragId.value === targetId) return

  const rows = type === 'income' ? props.incomeRows : props.expenseRows
  const ids = rows.map((r) => r.category.id)
  const fromIndex = ids.indexOf(dragId.value)
  const toIndex = ids.indexOf(targetId)
  if (fromIndex === -1 || toIndex === -1) return

  ids.splice(fromIndex, 1)
  ids.splice(toIndex, 0, dragId.value)
  emit('reorder', type, ids)
  clearDrag()
}

function clearDrag() {
  dragId.value = null
  dragOverId.value = null
}

function bulkHide(type) {
  const selection = type === 'income' ? incomeSelection : expenseSelection
  emit('bulk-hide', [...selection.selectedIds.value], selection)
}

function bulkDelete(type) {
  const selection = type === 'income' ? incomeSelection : expenseSelection
  emit('bulk-delete', [...selection.selectedIds.value], selection)
}

function bulkRollover(type, value) {
  const selection = type === 'income' ? incomeSelection : expenseSelection
  emit('bulk-rollover', [...selection.selectedIds.value], value, selection)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6">
    <div class="bg-canvas border border-hairline rounded-notion-lg overflow-hidden">
      <div class="px-4 py-3 bg-tint-mint/50 border-b border-hairline flex items-center justify-between">
        <h3 class="text-sm font-semibold text-charcoal">Income</h3>
        <NotionButton size="sm" variant="secondary" @click="$emit('add-category', 'income')">
          + Add
        </NotionButton>
      </div>

      <div v-if="incomeSelection.hasSelection.value" class="px-3 py-2 border-b border-hairline">
        <BulkActionBar :count="incomeSelection.selectedCount.value" @clear="incomeSelection.clear()">
          <NotionButton size="sm" variant="secondary" @click="bulkHide('income')">Hide selected</NotionButton>
          <NotionButton size="sm" variant="secondary" @click="bulkRollover('income', true)">Enable rollover</NotionButton>
          <NotionButton size="sm" variant="danger" @click="bulkDelete('income')">Delete selected</NotionButton>
        </BulkActionBar>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden p-3 space-y-3">
        <div
          v-for="row in incomeRows"
          :key="row.category.id"
          class="border border-hairline rounded-notion p-3 space-y-2"
          :class="incomeSelection.isSelected(row.category.id) ? 'bg-primary/5 border-primary/30' : ''"
        >
          <div class="flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              :checked="incomeSelection.isSelected(row.category.id)"
              class="rounded border-hairline text-primary focus:ring-primary/30"
              @change="incomeSelection.toggle(row.category.id)"
            />
            <FeatherIcon :name="row.category.icon" :size="16" class="shrink-0" />
            <input
              v-if="editingId === row.category.id"
              v-model="nameDraft"
              type="text"
              class="flex-1 min-w-0 text-sm px-2 py-1.5 border border-primary rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
              autofocus
              @blur="saveName(row)"
              @keydown.enter="saveName(row)"
              @keydown.escape="editingId = null"
            />
            <button
              v-else
              type="button"
              class="flex-1 min-w-0 text-left text-sm font-medium text-charcoal truncate"
              @click="startNameEdit(row)"
            >
              {{ row.category.name }}
            </button>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-steel">Budgeted: <span class="text-charcoal">{{ formatCurrency(row.baseBudgeted ?? row.budgeted) }}</span></span>
            <span class="text-steel">Spent: <span class="text-charcoal">{{ formatCurrency(row.actual) }}</span></span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium" :class="statusClass(row.remaining, row.budgeted)">
              Remaining: {{ formatCurrency(row.remaining) }}
            </span>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 cursor-pointer text-xs text-steel" title="Roll over unused budget">
                <input
                  type="checkbox"
                  :checked="row.category.rollover"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  @change="$emit('update-rollover', row.category.id, $event.target.checked)"
                />
                Rollover
              </label>
              <button
                type="button"
                class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Hide category"
                @click="$emit('hide', row.category.id)"
              >
                <FeatherIcon name="eye-off" :size="14" />
              </button>
              <button
                type="button"
                class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Delete category permanently"
                @click="$emit('delete', row.category.id, row.category.name)"
              >
                <FeatherIcon name="trash-2" :size="14" />
              </button>
            </div>
          </div>
          <input
            type="number"
            :value="row.baseBudgeted ?? row.budgeted"
            min="0"
            step="0.01"
            class="w-full text-sm px-3 py-2 border border-hairline rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Budget amount"
            @change="$emit('update-budget', row.category.id, $event.target.value)"
          />
        </div>
        <p v-if="!incomeRows.length" class="py-6 text-center text-sm text-steel">
          No income categories. Add one to start budgeting.
        </p>
        <div v-if="incomeRows.length" class="pt-2 border-t border-hairline flex justify-between text-sm font-semibold">
          <span class="text-charcoal">Total</span>
          <span class="text-success">{{ formatCurrency(totalIncome) }}</span>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hidden md:block">
        <table class="w-full min-w-[720px] table-fixed hidden md:table">
          <colgroup>
            <col class="w-10" />
            <col class="w-10" />
            <col />
            <col class="w-28" />
            <col class="w-28" />
            <col class="w-28" />
            <col class="w-32" />
          </colgroup>
          <thead>
            <tr class="text-xs text-steel border-b border-hairline">
              <th class="py-2 px-2 w-10">
                <input
                  type="checkbox"
                  :checked="incomeSelection.allSelected.value"
                  :indeterminate="incomeSelection.someSelected.value"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  title="Select all"
                  @change="incomeSelection.toggleAll()"
                />
              </th>
              <th class="py-2 px-2"></th>
              <th class="py-2 px-3 text-left font-medium">Category</th>
              <th class="py-2 px-3 text-right font-medium">Budgeted</th>
              <th class="py-2 px-3 text-right font-medium">Actual</th>
              <th class="py-2 px-3 text-right font-medium">Remaining</th>
              <th class="py-2 px-2 text-right font-medium">Options</th>
            </tr>
          </thead>
          <tbody>
            <BudgetRow
              v-for="row in incomeRows"
              :key="row.category.id"
              :row="row"
              type="income"
              selectable
              :selected="incomeSelection.isSelected(row.category.id)"
              :dragging="dragId === row.category.id"
              :drag-over="dragOverId === row.category.id && dragId !== row.category.id"
              @update-budget="(id, val) => $emit('update-budget', id, val)"
              @update-name="(id, val) => $emit('update-name', id, val)"
              @update-rollover="(id, val) => $emit('update-rollover', id, val)"
              @hide="(id) => $emit('hide', id)"
              @delete="(id, name) => $emit('delete', id, name)"
              @toggle-select="incomeSelection.toggle"
              @drag-start="handleDragStart"
              @drag-over="handleDragOver"
              @drop="(id) => handleDrop('income', id)"
              @drag-end="clearDrag"
            />
            <tr v-if="!incomeRows.length">
              <td colspan="7" class="py-8 text-center text-sm text-steel">
                No income categories. Add one to start budgeting.
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-hairline bg-surface/50 font-semibold">
              <td colspan="4" class="py-2.5 px-3 text-sm text-charcoal">Total</td>
              <td class="py-2.5 px-3 text-right text-sm text-success whitespace-nowrap">{{ formatCurrency(totalIncome) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="bg-canvas border border-hairline rounded-notion-lg overflow-hidden">
      <div class="px-4 py-3 bg-tint-rose/50 border-b border-hairline flex items-center justify-between">
        <h3 class="text-sm font-semibold text-charcoal">Expenses</h3>
        <NotionButton size="sm" variant="secondary" @click="$emit('add-category', 'expense')">
          + Add
        </NotionButton>
      </div>

      <div v-if="expenseSelection.hasSelection.value" class="px-3 py-2 border-b border-hairline">
        <BulkActionBar :count="expenseSelection.selectedCount.value" @clear="expenseSelection.clear()">
          <NotionButton size="sm" variant="secondary" @click="bulkHide('expense')">Hide selected</NotionButton>
          <NotionButton size="sm" variant="secondary" @click="bulkRollover('expense', true)">Enable rollover</NotionButton>
          <NotionButton size="sm" variant="danger" @click="bulkDelete('expense')">Delete selected</NotionButton>
        </BulkActionBar>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden p-3 space-y-3">
        <div
          v-for="row in expenseRows"
          :key="row.category.id"
          class="border border-hairline rounded-notion p-3 space-y-2"
          :class="expenseSelection.isSelected(row.category.id) ? 'bg-primary/5 border-primary/30' : ''"
        >
          <div class="flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              :checked="expenseSelection.isSelected(row.category.id)"
              class="rounded border-hairline text-primary focus:ring-primary/30"
              @change="expenseSelection.toggle(row.category.id)"
            />
            <FeatherIcon :name="row.category.icon" :size="16" class="shrink-0" />
            <input
              v-if="editingId === row.category.id"
              v-model="nameDraft"
              type="text"
              class="flex-1 min-w-0 text-sm px-2 py-1.5 border border-primary rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
              autofocus
              @blur="saveName(row)"
              @keydown.enter="saveName(row)"
              @keydown.escape="editingId = null"
            />
            <button
              v-else
              type="button"
              class="flex-1 min-w-0 text-left text-sm font-medium text-charcoal truncate"
              @click="startNameEdit(row)"
            >
              {{ row.category.name }}
            </button>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-steel">Budgeted: <span class="text-charcoal">{{ formatCurrency(row.baseBudgeted ?? row.budgeted) }}</span></span>
            <span class="text-steel">Spent: <span class="text-charcoal">{{ formatCurrency(row.actual) }}</span></span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium" :class="statusClass(row.remaining, row.budgeted)">
              Remaining: {{ formatCurrency(row.remaining) }}
            </span>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1.5 cursor-pointer text-xs text-steel" title="Roll over unused budget">
                <input
                  type="checkbox"
                  :checked="row.category.rollover"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  @change="$emit('update-rollover', row.category.id, $event.target.checked)"
                />
                Rollover
              </label>
              <button
                type="button"
                class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Hide category"
                @click="$emit('hide', row.category.id)"
              >
                <FeatherIcon name="eye-off" :size="14" />
              </button>
              <button
                type="button"
                class="p-2 rounded-notion-sm text-steel hover:text-error hover:bg-tint-rose/50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Delete category permanently"
                @click="$emit('delete', row.category.id, row.category.name)"
              >
                <FeatherIcon name="trash-2" :size="14" />
              </button>
            </div>
          </div>
          <input
            type="number"
            :value="row.baseBudgeted ?? row.budgeted"
            min="0"
            step="0.01"
            class="w-full text-sm px-3 py-2 border border-hairline rounded-notion-sm bg-canvas focus:outline-none focus:ring-1 focus:ring-primary/30"
            placeholder="Budget amount"
            @change="$emit('update-budget', row.category.id, $event.target.value)"
          />
        </div>
        <p v-if="!expenseRows.length" class="py-6 text-center text-sm text-steel">
          No expense categories. Add one to start budgeting.
        </p>
        <div v-if="expenseRows.length" class="pt-2 border-t border-hairline flex justify-between text-sm font-semibold">
          <span class="text-charcoal">Total</span>
          <span class="text-error">{{ formatCurrency(totalExpenses) }}</span>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hidden md:block">
        <table class="w-full min-w-[720px] table-fixed hidden md:table">
          <colgroup>
            <col class="w-10" />
            <col class="w-10" />
            <col />
            <col class="w-28" />
            <col class="w-28" />
            <col class="w-28" />
            <col class="w-32" />
          </colgroup>
          <thead>
            <tr class="text-xs text-steel border-b border-hairline">
              <th class="py-2 px-2 w-10">
                <input
                  type="checkbox"
                  :checked="expenseSelection.allSelected.value"
                  :indeterminate="expenseSelection.someSelected.value"
                  class="rounded border-hairline text-primary focus:ring-primary/30"
                  title="Select all"
                  @change="expenseSelection.toggleAll()"
                />
              </th>
              <th class="py-2 px-2"></th>
              <th class="py-2 px-3 text-left font-medium">Category</th>
              <th class="py-2 px-3 text-right font-medium">Budgeted</th>
              <th class="py-2 px-3 text-right font-medium">Actual</th>
              <th class="py-2 px-3 text-right font-medium">Remaining</th>
              <th class="py-2 px-2 text-right font-medium">Options</th>
            </tr>
          </thead>
          <tbody>
            <BudgetRow
              v-for="row in expenseRows"
              :key="row.category.id"
              :row="row"
              type="expense"
              selectable
              :selected="expenseSelection.isSelected(row.category.id)"
              :dragging="dragId === row.category.id"
              :drag-over="dragOverId === row.category.id && dragId !== row.category.id"
              @update-budget="(id, val) => $emit('update-budget', id, val)"
              @update-name="(id, val) => $emit('update-name', id, val)"
              @update-rollover="(id, val) => $emit('update-rollover', id, val)"
              @hide="(id) => $emit('hide', id)"
              @delete="(id, name) => $emit('delete', id, name)"
              @toggle-select="expenseSelection.toggle"
              @drag-start="handleDragStart"
              @drag-over="handleDragOver"
              @drop="(id) => handleDrop('expense', id)"
              @drag-end="clearDrag"
            />
            <tr v-if="!expenseRows.length">
              <td colspan="7" class="py-8 text-center text-sm text-steel">
                No expense categories. Add one to start budgeting.
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t border-hairline bg-surface/50 font-semibold">
              <td colspan="4" class="py-2.5 px-3 text-sm text-charcoal">Total</td>
              <td class="py-2.5 px-3 text-right text-sm text-error whitespace-nowrap">{{ formatCurrency(totalExpenses) }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>

  <div class="mt-6 bg-surface text-ink dark:bg-primary/20 rounded-notion-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <span class="text-sm font-medium">Income − Expenses = Available</span>
    <span class="text-xl sm:text-2xl font-bold" :class="remaining >= 0 ? 'text-success' : 'text-error'">
      {{ formatCurrency(remaining) }}
    </span>
  </div>

  <p class="text-xs text-steel mt-3 hidden md:block">
    Drag rows to reorder. Click a category name to rename. Hide removes a category from the budget; trash deletes it permanently. Hidden categories can be restored in Settings.
  </p>
</template>
