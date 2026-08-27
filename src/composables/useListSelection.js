import { ref, computed, watch, unref } from 'vue'

export function useListSelection(items, getId = (item) => item.id) {
  const selectedIds = ref([])

  const itemList = computed(() => unref(items))

  const selectedCount = computed(() => selectedIds.value.length)
  const hasSelection = computed(() => selectedIds.value.length > 0)

  const allSelected = computed(() => {
    const list = itemList.value
    return list.length > 0 && list.every((item) => selectedIds.value.includes(getId(item)))
  })

  const someSelected = computed(() => hasSelection.value && !allSelected.value)

  watch(itemList, (list) => {
    const visible = new Set(list.map(getId))
    selectedIds.value = selectedIds.value.filter((id) => visible.has(id))
  })

  function isSelected(id) {
    return selectedIds.value.includes(id)
  }

  function toggle(id) {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((x) => x !== id)
    } else {
      selectedIds.value = [...selectedIds.value, id]
    }
  }

  function toggleAll() {
    if (allSelected.value) {
      selectedIds.value = []
    } else {
      selectedIds.value = itemList.value.map(getId)
    }
  }

  function clear() {
    selectedIds.value = []
  }

  function selectedItems() {
    return itemList.value.filter((item) => selectedIds.value.includes(getId(item)))
  }

  return {
    selectedIds,
    selectedCount,
    hasSelection,
    allSelected,
    someSelected,
    isSelected,
    toggle,
    toggleAll,
    clear,
    selectedItems,
  }
}
