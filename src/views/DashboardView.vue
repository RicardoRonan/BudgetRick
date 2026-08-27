<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import BudgetSummary from '../components/budget/BudgetSummary.vue'
import IncomeVsExpense from '../components/charts/IncomeVsExpense.vue'
import SpendingPie from '../components/charts/SpendingPie.vue'
import TrendLine from '../components/charts/TrendLine.vue'
import TransactionList from '../components/transactions/TransactionList.vue'
import GoalCard from '../components/goals/GoalCard.vue'
import NotionCard from '../components/ui/NotionCard.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import { useBudgetStore } from '../stores/budget.js'
import { useTransactionsStore } from '../stores/transactions.js'
import { useGoalsStore } from '../stores/goals.js'
import { useRecurringStore } from '../stores/recurring.js'
import { useBillReminders } from '../composables/useBillReminders.js'
import { useCurrency } from '../composables/useCurrency.js'
import { useRouter } from 'vue-router'

const budgetStore = useBudgetStore()
const transactionsStore = useTransactionsStore()
const goalsStore = useGoalsStore()
const recurringStore = useRecurringStore()
const router = useRouter()
const { formatCurrency } = useCurrency()
const { dashboardBills } = useBillReminders()

const { goals } = storeToRefs(goalsStore)

const recentTransactions = computed(() =>
  [...transactionsStore.transactions]
    .sort((a, b) => parseISO(b.date) - parseISO(a.date))
    .slice(0, 8)
)

const trendData = computed(() => {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i)
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const monthTx = transactionsStore.transactions.filter((t) => {
      const d = parseISO(t.date)
      return isWithinInterval(d, { start, end })
    })
    months.push({
      label: format(monthDate, 'MMM'),
      income: monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
      expenses: monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    })
  }
  return months
})

const activeGoals = computed(() => goals.value.slice(0, 3))

function billStatusClass(bill) {
  if (bill.isOverdue) return 'text-error'
  if (bill.daysUntilDue <= 2) return 'text-warning'
  return 'text-charcoal'
}

function billDueLabel(bill) {
  if (bill.isOverdue) {
    const days = Math.abs(bill.daysUntilDue)
    return days === 1 ? '1 day overdue' : `${days} days overdue`
  }
  if (bill.daysUntilDue === 0) return 'Due today'
  if (bill.daysUntilDue === 1) return 'Due tomorrow'
  return `Due in ${bill.daysUntilDue} days`
}

async function handleMarkPaid(bill) {
  await recurringStore.markBillPaid(bill)
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold text-charcoal">Dashboard</h1>
        <p class="text-sm text-steel mt-0.5">{{ budgetStore.monthLabel }}</p>
      </div>
      <NotionButton class="w-full sm:w-auto shrink-0" @click="router.push('/transactions')">
        + Add Transaction
      </NotionButton>
    </div>

    <NotionCard v-if="dashboardBills.length">
      <h2 class="text-sm font-semibold text-charcoal mb-4">Upcoming Bills</h2>
      <div class="space-y-2">
        <div
          v-for="bill in dashboardBills"
          :key="bill.id"
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 rounded-notion border border-hairline"
          :class="bill.isOverdue ? 'bg-tint-rose/30' : bill.daysUntilDue <= 2 ? 'bg-tint-peach/30' : 'bg-tint-yellow/30'"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-charcoal">{{ bill.name }}</p>
            <p class="text-xs flex flex-col sm:flex-row sm:items-center gap-1" :class="billStatusClass(bill)">
              <span>{{ formatCurrency(bill.amount) }}</span>
              <span class="hidden sm:inline">·</span>
              <span>{{ bill.next_date }}</span>
              <span class="hidden sm:inline">·</span>
              <span>{{ billDueLabel(bill) }}</span>
            </p>
          </div>
          <NotionButton size="sm" variant="secondary" @click="handleMarkPaid(bill)">
            Mark Paid
          </NotionButton>
        </div>
      </div>
    </NotionCard>

    <BudgetSummary
      :income="budgetStore.totalIncome"
      :expenses="budgetStore.totalExpenses"
      :remaining="budgetStore.remaining"
      :savings-rate="budgetStore.savingsRate"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <NotionCard>
        <h2 class="text-sm font-semibold text-charcoal mb-4">Income vs Expenses</h2>
        <IncomeVsExpense :income="budgetStore.totalIncome" :expenses="budgetStore.totalExpenses" />
      </NotionCard>
      <NotionCard>
        <h2 class="text-sm font-semibold text-charcoal mb-4">Spending Breakdown</h2>
        <SpendingPie :data="budgetStore.spendingByCategory" />
      </NotionCard>
    </div>

    <NotionCard>
      <h2 class="text-sm font-semibold text-charcoal mb-4">6-Month Trend</h2>
      <TrendLine :months="trendData" />
    </NotionCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-charcoal">Recent Transactions</h2>
          <button class="text-xs text-primary hover:underline" @click="router.push('/transactions')">
            View all
          </button>
        </div>
        <TransactionList :transactions="recentTransactions" compact />
      </div>

      <div v-if="activeGoals.length">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-charcoal">Savings Goals</h2>
          <button class="text-xs text-primary hover:underline" @click="router.push('/goals')">
            View all
          </button>
        </div>
        <div class="space-y-3">
          <GoalCard
            v-for="goal in activeGoals"
            :key="goal.id"
            :goal="goal"
          />
        </div>
      </div>
    </div>
  </div>
</template>
