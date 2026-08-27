import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCollection } from '../composables/useSupabase.js'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const records = await getCollection('categories').getFullList()
      categories.value = records.sort((a, b) => a.sort_order - b.sort_order)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data) {
    const maxOrder = categories.value.reduce((max, c) => Math.max(max, c.sort_order), -1)
    const record = await getCollection('categories').create({
      ...data,
      sort_order: maxOrder + 1,
      is_active: true,
    })
    categories.value.push(record)
    categories.value.sort((a, b) => a.sort_order - b.sort_order)
    return record
  }

  async function updateCategory(id, data) {
    const record = await getCollection('categories').update(id, data)
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = record
    return record
  }

  async function deleteCategory(id) {
    await getCollection('categories').delete(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  function getCategoryById(id) {
    return categories.value.find((c) => c.id === id)
  }

  async function reorderCategories(type, orderedIds) {
    const typeCats = categories.value.filter((c) => c.type === type)
    if (!typeCats.length) return

    const baseOrder = Math.min(...typeCats.map((c) => c.sort_order ?? 0))
    const updates = orderedIds.map((id, index) => {
      const cat = categories.value.find((c) => c.id === id)
      const newOrder = baseOrder + index
      if (!cat || cat.sort_order === newOrder) return null
      return getCollection('categories').update(id, { sort_order: newOrder }).then((record) => {
        const idx = categories.value.findIndex((c) => c.id === id)
        if (idx !== -1) categories.value[idx] = record
      })
    })

    await Promise.all(updates.filter(Boolean))
    categories.value.sort((a, b) => a.sort_order - b.sort_order)
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    getCategoryById,
  }
})
