import { ref, computed } from 'vue'
import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export function useTransactions(transactions) {
  const searchQuery = ref('')
  const typeFilter = ref('all')
  const categoryFilter = ref([])
  const dateFrom = ref(null)
  const dateTo = ref(null)
  const sortField = ref('date')
  const sortDirection = ref('desc')

  const filtered = computed(() => {
    let result = [...transactions.value]

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      )
    }

    if (typeFilter.value !== 'all') {
      result = result.filter((t) => t.type === typeFilter.value)
    }

    if (categoryFilter.value.length > 0) {
      result = result.filter((t) => {
        if (categoryFilter.value.includes(t.category_id)) return true
        if (t.splits?.some((s) => categoryFilter.value.includes(s.category_id))) return true
        return false
      })
    }

    if (dateFrom.value) {
      const from = startOfDay(parseISO(dateFrom.value))
      result = result.filter((t) => parseISO(t.date) >= from)
    }

    if (dateTo.value) {
      const to = endOfDay(parseISO(dateTo.value))
      result = result.filter((t) => parseISO(t.date) <= to)
    }

    result.sort((a, b) => {
      let aVal = a[sortField.value]
      let bVal = b[sortField.value]
      if (sortField.value === 'date') {
        aVal = parseISO(aVal).getTime()
        bVal = parseISO(bVal).getTime()
      } else if (sortField.value === 'amount') {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }
      return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  })

  function toggleSort(field) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'desc'
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    typeFilter.value = 'all'
    categoryFilter.value = []
    dateFrom.value = null
    dateTo.value = null
  }

  return {
    searchQuery,
    typeFilter,
    categoryFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
    filtered,
    toggleSort,
    resetFilters,
  }
}
