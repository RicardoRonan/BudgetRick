<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import GoalCard from '../components/goals/GoalCard.vue'
import GoalForm from '../components/goals/GoalForm.vue'
import NotionModal from '../components/ui/NotionModal.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import BulkActionBar from '../components/ui/BulkActionBar.vue'
import { useGoalsStore } from '../stores/goals.js'
import { useListSelection } from '../composables/useListSelection.js'
import { useConfirm } from '../composables/useConfirm.js'

const goalsStore = useGoalsStore()
const { confirm } = useConfirm()
const { goals } = storeToRefs(goalsStore)

const selection = useListSelection(goals)

const showForm = ref(false)
const editingGoal = ref(null)
const showAddMoney = ref(false)
const addMoneyGoal = ref(null)
const addMoneyAmount = ref('')

function openAdd() {
  editingGoal.value = null
  showForm.value = true
}

function openEdit(goal) {
  editingGoal.value = goal
  showForm.value = true
}

async function handleSave(data) {
  if (editingGoal.value) {
    await goalsStore.updateGoal(editingGoal.value.id, data)
  } else {
    await goalsStore.createGoal(data)
  }
}

async function handleDelete(id) {
  const confirmed = await confirm({
    title: 'Delete goal',
    message: 'Delete this savings goal? This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (confirmed) {
    await goalsStore.deleteGoal(id)
    if (selection.isSelected(id)) selection.toggle(id)
  }
}

async function bulkDelete() {
  const count = selection.selectedCount.value
  const confirmed = await confirm({
    title: 'Delete goals',
    message: `Delete ${count} savings goal${count === 1 ? '' : 's'}? This cannot be undone.`,
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  })
  if (!confirmed) return
  await goalsStore.deleteGoals(selection.selectedIds.value)
  selection.clear()
}

function openAddMoney(goal) {
  addMoneyGoal.value = goal
  addMoneyAmount.value = ''
  showAddMoney.value = true
}

async function handleAddMoney() {
  if (!addMoneyAmount.value) return
  await goalsStore.addToGoal(addMoneyGoal.value.id, Number(addMoneyAmount.value))
  showAddMoney.value = false
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold text-charcoal">Savings Goals</h1>
        <p class="text-sm text-steel mt-0.5">Track progress toward your financial targets</p>
      </div>
      <NotionButton class="w-full sm:w-auto shrink-0" @click="openAdd">+ New Goal</NotionButton>
    </div>

    <BulkActionBar :count="selection.selectedCount.value" @clear="selection.clear()">
      <NotionButton size="sm" variant="danger" @click="bulkDelete">Delete selected</NotionButton>
    </BulkActionBar>

    <div v-if="goals.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <GoalCard
        v-for="goal in goals"
        :key="goal.id"
        :goal="goal"
        selectable
        :selected="selection.isSelected(goal.id)"
        @edit="openEdit"
        @delete="handleDelete"
        @add-money="openAddMoney"
        @toggle-select="selection.toggle"
      />
    </div>

    <div v-else class="text-center py-16 text-steel">
      <p class="text-lg mb-2">No savings goals yet</p>
      <p class="text-sm mb-4">Create your first goal to start tracking progress</p>
      <NotionButton @click="openAdd">Create Goal</NotionButton>
    </div>

    <GoalForm v-model="showForm" :goal="editingGoal" @save="handleSave" />

    <NotionModal v-model="showAddMoney" title="Add Money to Goal">
      <form class="space-y-4" @submit.prevent="handleAddMoney">
        <p class="text-sm text-steel">Adding to: <strong class="text-charcoal">{{ addMoneyGoal?.name }}</strong></p>
        <NotionInput v-model="addMoneyAmount" label="Amount" type="number" placeholder="0.00" />
        <div class="flex justify-end gap-2">
          <NotionButton variant="secondary" @click="showAddMoney = false">Cancel</NotionButton>
          <NotionButton type="submit">Add</NotionButton>
        </div>
      </form>
    </NotionModal>
  </div>
</template>
