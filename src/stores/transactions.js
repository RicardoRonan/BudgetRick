import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCollection } from '../composables/useSupabase.js'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      transactions.value = await getCollection('transactions').getFullList()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(data) {
    const record = await getCollection('transactions').create(data)
    transactions.value.unshift(record)
    return record
  }

  async function updateTransaction(id, data) {
    const record = await getCollection('transactions').update(id, data)
    const index = transactions.value.findIndex((t) => t.id === id)
    if (index !== -1) transactions.value[index] = record
    return record
  }

  async function deleteTransaction(id) {
    await getCollection('transactions').delete(id)
    transactions.value = transactions.value.filter((t) => t.id !== id)
  }

  async function deleteTransactions(ids) {
    await Promise.all(ids.map((id) => getCollection('transactions').delete(id)))
    const idSet = new Set(ids)
    transactions.value = transactions.value.filter((t) => !idSet.has(t.id))
  }

  async function updateTransactions(ids, data) {
    const records = await Promise.all(
      ids.map((id) => getCollection('transactions').update(id, data))
    )
    for (const record of records) {
      const index = transactions.value.findIndex((t) => t.id === record.id)
      if (index !== -1) transactions.value[index] = record
    }
    return records
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    updateTransactions,
  }
})
