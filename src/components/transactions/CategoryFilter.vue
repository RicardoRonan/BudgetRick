<script setup>
import { computed } from 'vue'
import { useCategoriesStore } from '../../stores/categories.js'
import NotionMultiSelect from '../ui/NotionMultiSelect.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  type: { type: String, default: 'all' },
})

defineEmits(['update:modelValue'])

const categoriesStore = useCategoriesStore()

const options = computed(() => {
  const cats = props.type === 'all'
    ? categoriesStore.categories.filter((c) => c.is_active)
    : categoriesStore.categories.filter((c) => c.is_active && c.type === props.type)
  return cats.map((c) => ({ value: c.id, label: c.name }))
})
</script>

<template>
  <NotionMultiSelect
    :model-value="modelValue"
    :options="options"
    placeholder="All categories"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
