import { computed } from 'vue'
import { parseISO, differenceInCalendarDays, startOfDay } from 'date-fns'
import { useRecurringStore } from '../stores/recurring.js'

export function useBillReminders() {
  const recurringStore = useRecurringStore()
  const today = startOfDay(new Date())

  function enrichBill(item) {
    const dueDate = startOfDay(parseISO(item.next_date))
    const daysUntilDue = differenceInCalendarDays(dueDate, today)
    const isOverdue = daysUntilDue < 0
    const reminderDays = item.reminder_days ?? 3
    const isUpcoming = !isOverdue && daysUntilDue <= reminderDays
    return {
      ...item,
      daysUntilDue,
      isOverdue,
      isUpcoming,
      reminderDays,
    }
  }

  const enrichedBills = computed(() =>
    recurringStore.recurring
      .filter((item) => item.is_active)
      .map(enrichBill)
  )

  const overdueBills = computed(() =>
    enrichedBills.value
      .filter((item) => item.isOverdue)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  )

  const upcomingBills = computed(() =>
    enrichedBills.value
      .filter((item) => item.isUpcoming)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  )

  const reminderCount = computed(() => overdueBills.value.length + upcomingBills.value.length)

  const dashboardBills = computed(() => {
    const seen = new Set()
    const combined = [...overdueBills.value, ...upcomingBills.value]
    return combined.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  })

  return {
    overdueBills,
    upcomingBills,
    dashboardBills,
    reminderCount,
  }
}
