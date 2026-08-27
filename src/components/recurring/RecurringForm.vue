<script setup>
import { ref, watch, computed } from 'vue'
import { format } from 'date-fns'
import NotionModal from '../ui/NotionModal.vue'
import NotionInput from '../ui/NotionInput.vue'
import NotionSelect from '../ui/NotionSelect.vue'
import NotionButton from '../ui/NotionButton.vue'
import { useCategoriesStore } from '../../stores/categories.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const categoriesStore = useCategoriesStore()

const form = ref({
  name: '',
  amount: '',
  category_id: '',
  frequency: 'monthly',
  next_date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
  reminder_days: 3,
})

const categoryOptions = computed(() =>
  categoriesStore.categories
    .filter((c) => c.is_active && c.type === 'expense')
    .map((c) => ({ value: c.id, label: c.name }))
)

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

watch(
  () => props.item,
  (item) => {
    if (item) {
      form.value = {
        name: item.name,
        amount: item.amount,
        category_id: item.category_id,
        frequency: item.frequency,
        next_date: item.next_date,
        notes: item.notes || '',
        reminder_days: item.reminder_days ?? 3,
      }
    } else {
      form.value = {
        name: '',
        amount: '',
        category_id: categoryOptions.value[0]?.value || '',
        frequency: 'monthly',
        next_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        reminder_days: 3,
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.value.name || !form.value.amount || !form.value.category_id) return
  emit('save', {
    ...form.value,
    amount: Number(form.value.amount),
    reminder_days: Number(form.value.reminder_days) || 3,
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <NotionModal
    :model-value="modelValue"
    :title="item ? 'Edit Recurring Bill' : 'Add Recurring Bill'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <NotionInput v-model="form.name" label="Name" placeholder="e.g. Netflix" />
      <NotionInput v-model="form.amount" label="Amount" type="number" placeholder="0.00" />
      <NotionSelect v-model="form.category_id" label="Category" :options="categoryOptions" />
      <NotionSelect v-model="form.frequency" label="Frequency" :options="frequencyOptions" />
      <NotionInput v-model="form.next_date" label="Next Due Date" type="date" />
      <NotionInput v-model="form.reminder_days" label="Reminder (days before due)" type="number" min="1" />
      <NotionInput v-model="form.notes" label="Notes" placeholder="Optional" />

      <div class="flex justify-end gap-2 pt-2">
        <NotionButton variant="secondary" type="button" @click="$emit('update:modelValue', false)">
          Cancel
        </NotionButton>
        <NotionButton type="submit">{{ item ? 'Update' : 'Add' }}</NotionButton>
      </div>
    </form>
  </NotionModal>
</template>
