import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { detectCurrency } from '../composables/useCurrency.js'

const STORAGE_KEY = 'br_theme'
const CURRENCY_KEY = 'br_currency'
const SIDEBAR_COLLAPSED_KEY = 'br_sidebar_collapsed'
const VALID_PREFERENCES = ['light', 'dark', 'system']

function getSystemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function normalizePreference(value) {
  return VALID_PREFERENCES.includes(value) ? value : 'light'
}

export const useUiStore = defineStore('ui', () => {
  const themePreference = ref(normalizePreference(localStorage.getItem(STORAGE_KEY)))
  const systemPrefersDark = ref(getSystemPrefersDark())
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true')
  const selectedMonth = ref(new Date())
  const currency = ref(localStorage.getItem(CURRENCY_KEY) || detectCurrency())

  watch(currency, (val) => {
    localStorage.setItem(CURRENCY_KEY, val)
  }, { immediate: true })

  watch(sidebarCollapsed, (val) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, val ? 'true' : 'false')
  })

  function setCurrency(code) {
    currency.value = code
  }

  const resolvedTheme = computed(() => {
    if (themePreference.value === 'system') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themePreference.value
  })

  function applyTheme() {
    document.documentElement.classList.toggle('dark', resolvedTheme.value === 'dark')
  }

  watch(themePreference, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
    applyTheme()
  }, { immediate: true })

  watch(resolvedTheme, () => {
    applyTheme()
  })

  if (typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })
  }

  function toggleTheme() {
    themePreference.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  }

  function setThemePreference(pref) {
    if (VALID_PREFERENCES.includes(pref)) {
      themePreference.value = pref
    }
  }

  function setMonth(date) {
    selectedMonth.value = date
  }

  function prevMonth() {
    const d = new Date(selectedMonth.value)
    d.setMonth(d.getMonth() - 1)
    selectedMonth.value = d
  }

  function nextMonth() {
    const d = new Date(selectedMonth.value)
    d.setMonth(d.getMonth() + 1)
    selectedMonth.value = d
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeSidebar() {
    sidebarOpen.value = false
  }

  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    themePreference,
    systemPrefersDark,
    resolvedTheme,
    sidebarOpen,
    sidebarCollapsed,
    selectedMonth,
    currency,
    setCurrency,
    toggleTheme,
    setThemePreference,
    setMonth,
    prevMonth,
    nextMonth,
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapsed,
  }
})
