import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCollection } from '../composables/useSupabase.js'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref([])
  const loading = ref(false)

  async function fetchGoals() {
    loading.value = true
    try {
      goals.value = await getCollection('goals').getFullList()
    } finally {
      loading.value = false
    }
  }

  async function createGoal(data) {
    const record = await getCollection('goals').create({
      current_amount: 0,
      ...data,
    })
    goals.value.push(record)
    return record
  }

  async function updateGoal(id, data) {
    const record = await getCollection('goals').update(id, data)
    const index = goals.value.findIndex((g) => g.id === id)
    if (index !== -1) goals.value[index] = record
    return record
  }

  async function deleteGoal(id) {
    await getCollection('goals').delete(id)
    goals.value = goals.value.filter((g) => g.id !== id)
  }

  async function deleteGoals(ids) {
    await Promise.all(ids.map((id) => getCollection('goals').delete(id)))
    const idSet = new Set(ids)
    goals.value = goals.value.filter((g) => !idSet.has(g.id))
  }

  async function addToGoal(id, amount) {
    const goal = goals.value.find((g) => g.id === id)
    if (!goal) return
    const newAmount = Number(goal.current_amount) + Number(amount)
    return updateGoal(id, { current_amount: newAmount })
  }

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    deleteGoals,
    addToGoal,
  }
})
