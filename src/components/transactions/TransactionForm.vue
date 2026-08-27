<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import NotionModal from '../ui/NotionModal.vue'
import NotionInput from '../ui/NotionInput.vue'
import NotionSelect from '../ui/NotionSelect.vue'
import NotionButton from '../ui/NotionButton.vue'
import { useCategoriesStore } from '../../stores/categories.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  transaction: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const categoriesStore = useCategoriesStore()

const form = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  splits: null,
})

const showSplits = ref(false)

const categoryOptions = computed(() =>
  categoriesStore.categories
    .filter((c) => c.is_active && c.type === form.value.type)
    .map((c) => ({ value: c.id, label: c.name }))
)

const splitsTotal = computed(() =>
  (form.value.splits || []).reduce((sum, s) => sum + Number(s.amount || 0), 0)
)

const splitsValid = computed(() => {
  if (!showSplits.value || !form.value.splits?.length) return true
  return Math.abs(splitsTotal.value - Number(form.value.amount || 0)) < 0.01
})

watch(
  () => props.transaction,
  (tx) => {
    if (tx) {
      form.value = {
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        category_id: tx.category_id,
        description: tx.description || '',
        splits: tx.splits ? [...tx.splits] : null,
      }
      showSplits.value = Boolean(tx.splits?.length)
    } else {
      form.value = {
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense',
        amount: '',
        category_id: '',
        description: '',
        splits: null,
      }
      showSplits.value = false
    }
  },
  { immediate: true }
)

watch(
  () => form.value.type,
  () => {
    const valid = categoryOptions.value.find((o) => o.value === form.value.category_id)
    if (!valid && categoryOptions.value.length) {
      form.value.category_id = categoryOptions.value[0].value
    }
  }
)

function toggleSplits() {
  showSplits.value = !showSplits.value
  if (showSplits.value && !form.value.splits?.length) {
    form.value.splits = [
      { category_id: form.value.category_id || categoryOptions.value[0]?.value || '', amount: form.value.amount || '', description: '' },
    ]
  }
  if (!showSplits.value) {
    form.value.splits = null
  }
}

function addSplit() {
  if (!form.value.splits) form.value.splits = []
  form.value.splits.push({
    category_id: categoryOptions.value[0]?.value || '',
    amount: '',
    description: '',
  })
}

function removeSplit(index) {
  form.value.splits.splice(index, 1)
  if (form.value.splits.length === 0) {
    showSplits.value = false
    form.value.splits = null
  }
}

function handleSubmit() {
  if (!form.value.amount || !form.value.category_id) return
  if (!splitsValid.value) return

  const payload = {
    ...form.value,
    amount: Number(form.value.amount),
    splits: showSplits.value && form.value.splits?.length ? form.value.splits.map((s) => ({
      category_id: s.category_id,
      amount: Number(s.amount),
      description: s.description || '',
    })) : null,
  }

  emit('save', payload)
  emit('update:modelValue', false)
}
</script>

<template>
  <NotionModal
    :model-value="modelValue"
    :title="transaction ? 'Edit Transaction' : 'Add Transaction'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="flex gap-2">
        <NotionButton
          :variant="form.type === 'income' ? 'primary' : 'secondary'"
          size="sm"
          type="button"
          @click="form.type = 'income'"
        >
          Income
        </NotionButton>
        <NotionButton
          :variant="form.type === 'expense' ? 'primary' : 'secondary'"
          size="sm"
          type="button"
          @click="form.type = 'expense'"
        >
          Expense
        </NotionButton>
      </div>

      <NotionInput v-model="form.date" label="Date" type="date" />
      <NotionInput v-model="form.amount" label="Amount" type="number" placeholder="0.00" />
      <NotionSelect v-model="form.category_id" label="Category" :options="categoryOptions" />
      <NotionInput v-model="form.description" label="Description" placeholder="Optional note" />

      <div>
        <NotionButton variant="secondary" size="sm" type="button" @click="toggleSplits">
          {{ showSplits ? 'Remove Splits' : 'Split' }}
        </NotionButton>
      </div>

      <div v-if="showSplits" class="space-y-3 border border-hairline rounded-notion p-3">
        <div
          v-for="(split, index) in form.splits"
          :key="index"
          class="grid grid-cols-1 sm:grid-cols-[1fr_100px_auto] gap-2 items-end"
        >
          <NotionSelect v-model="split.category_id" label="Category" :options="categoryOptions" />
          <NotionInput v-model="split.amount" label="Amount" type="number" placeholder="0.00" />
          <NotionButton variant="secondary" size="sm" type="button" @click="removeSplit(index)">
            Remove
          </NotionButton>
        </div>
        <div class="flex items-center justify-between">
          <NotionButton variant="secondary" size="sm" type="button" @click="addSplit">
            Add Split
          </NotionButton>
          <span class="text-xs" :class="splitsValid ? 'text-steel' : 'text-error'">
            Total: {{ splitsTotal.toFixed(2) }} / {{ Number(form.amount || 0).toFixed(2) }}
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <NotionButton variant="secondary" type="button" @click="$emit('update:modelValue', false)">
          Cancel
        </NotionButton>
        <NotionButton type="submit" :disabled="!splitsValid">
          {{ transaction ? 'Update' : 'Add' }}
        </NotionButton>
      </div>
    </form>
  </NotionModal>
</template>
