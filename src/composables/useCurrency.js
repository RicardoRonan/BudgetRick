import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '../stores/ui.js'

export const CURRENCIES = [
  { code: 'ZAR', symbol: 'R', label: 'South African Rand', locale: 'en-ZA' },
  { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
]

export function detectCurrency() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (tz.startsWith('Africa/')) return 'ZAR'
  const lang = navigator.language
  if (lang.startsWith('en-ZA') || lang.startsWith('af')) return 'ZAR'
  return 'USD'
}

function getCurrencyMeta(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[1]
}

export function useCurrency() {
  const uiStore = useUiStore()
  const { currency } = storeToRefs(uiStore)

  const currencyMeta = computed(() => getCurrencyMeta(currency.value))

  function formatCurrency(val) {
    const meta = currencyMeta.value
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: meta.code,
    }).format(val)
  }

  function formatCompact(val) {
    const meta = currencyMeta.value
    return meta.symbol + Number(val).toLocaleString(meta.locale)
  }

  function setCurrency(code) {
    uiStore.setCurrency(code)
  }

  return {
    currency,
    currencyMeta,
    setCurrency,
    formatCurrency,
    formatCompact,
    CURRENCIES,
  }
}
