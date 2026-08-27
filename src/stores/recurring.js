import { defineStore } from 'pinia'
import { ref } from 'vue'
import { addWeeks, addMonths, addYears, parseISO, format, isBefore, startOfDay } from 'date-fns'
import { getCollection } from '../composables/useSupabase.js'
import { useTransactionsStore } from './transactions.js'

export const useRecurringStore = defineStore('recurring', () => {
  const recurring = ref([])
  const loading = ref(false)

  async function fetchRecurring() {
    loading.value = true
    try {
      recurring.value = await getCollection('recurring').getFullList()
    } finally {
      loading.value = false
    }
  }

  async function createRecurring(data) {
    const record = await getCollection('recurring').create({
      is_active: true,
      reminder_days: 3,
      ...data,
    })
    recurring.value.push(record)
    return record
  }

  async function updateRecurring(id, data) {
    const record = await getCollection('recurring').update(id, data)
    const index = recurring.value.findIndex((r) => r.id === id)
    if (index !== -1) recurring.value[index] = record
    return record
  }

  async function deleteRecurring(id) {
    await getCollection('recurring').delete(id)
    recurring.value = recurring.value.filter((r) => r.id !== id)
  }

  async function deleteRecurringMany(ids) {
    await Promise.all(ids.map((id) => getCollection('recurring').delete(id)))
    const idSet = new Set(ids)
    recurring.value = recurring.value.filter((r) => !idSet.has(r.id))
  }

  async function updateRecurringMany(ids, data) {
    const records = await Promise.all(
      ids.map((id) => getCollection('recurring').update(id, data))
    )
    for (const record of records) {
      const index = recurring.value.findIndex((r) => r.id === record.id)
      if (index !== -1) recurring.value[index] = record
    }
    return records
  }

  function getNextDate(currentDate, frequency) {
    const date = parseISO(currentDate)
    switch (frequency) {
      case 'weekly': return addWeeks(date, 1)
      case 'biweekly': return addWeeks(date, 2)
      case 'monthly': return addMonths(date, 1)
      case 'quarterly': return addMonths(date, 3)
      case 'yearly': return addYears(date, 1)
      default: return addMonths(date, 1)
    }
  }

  async function processDueItems() {
    const transactionsStore = useTransactionsStore()
    const today = startOfDay(new Date())

    for (const item of recurring.value) {
      if (!item.is_active) continue

      let nextDate = parseISO(item.next_date)
      while (isBefore(nextDate, today) || nextDate.getTime() === today.getTime()) {
        await transactionsStore.createTransaction({
          date: format(nextDate, 'yyyy-MM-dd'),
          type: 'expense',
          amount: item.amount,
          category_id: item.category_id,
          description: item.name,
          is_recurring: true,
          recurring_id: item.id,
        })
        nextDate = getNextDate(format(nextDate, 'yyyy-MM-dd'), item.frequency)
      }

      const formatted = format(nextDate, 'yyyy-MM-dd')
      if (formatted !== item.next_date) {
        await updateRecurring(item.id, { next_date: formatted })
      }
    }
  }

  async function markBillPaid(item) {
    const transactionsStore = useTransactionsStore()
    await transactionsStore.createTransaction({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      amount: item.amount,
      category_id: item.category_id,
      description: item.name,
      is_recurring: true,
      recurring_id: item.id,
    })

    const nextDate = format(getNextDate(item.next_date, item.frequency), 'yyyy-MM-dd')
    await updateRecurring(item.id, { next_date: nextDate })
  }

  return {
    recurring,
    loading,
    fetchRecurring,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    deleteRecurringMany,
    updateRecurringMany,
    processDueItems,
    markBillPaid,
  }
})
