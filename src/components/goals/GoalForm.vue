<script setup>
import { ref, watch } from 'vue'
import NotionModal from '../ui/NotionModal.vue'
import NotionInput from '../ui/NotionInput.vue'
import NotionButton from '../ui/NotionButton.vue'
import { categoryTints } from '../../design/colors.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  goal: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  target_amount: '',
  deadline: '',
  color: categoryTints[0],
  notes: '',
})

watch(
  () => props.goal,
  (g) => {
    if (g) {
      form.value = {
        name: g.name,
        target_amount: g.target_amount,
        deadline: g.deadline || '',
        color: g.color || categoryTints[0],
        notes: g.notes || '',
      }
    } else {
      form.value = {
        name: '',
        target_amount: '',
        deadline: '',
        color: categoryTints[0],
        notes: '',
      }
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!form.value.name || !form.value.target_amount) return
  emit('save', {
    ...form.value,
    target_amount: Number(form.value.target_amount),
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <NotionModal
    :model-value="modelValue"
    :title="goal ? 'Edit Goal' : 'New Savings Goal'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <NotionInput v-model="form.name" label="Goal Name" placeholder="e.g. Emergency Fund" />
      <NotionInput v-model="form.target_amount" label="Target Amount" type="number" placeholder="5000" />
      <NotionInput v-model="form.deadline" label="Deadline" type="date" />
      <NotionInput v-model="form.notes" label="Notes" placeholder="Optional" />

      <div class="flex justify-end gap-2 pt-2">
        <NotionButton variant="secondary" type="button" @click="$emit('update:modelValue', false)">
          Cancel
        </NotionButton>
        <NotionButton type="submit">{{ goal ? 'Update' : 'Create' }}</NotionButton>
      </div>
    </form>
  </NotionModal>
</template>
