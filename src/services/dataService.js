const STORAGE_KEYS = {
  transactions: 'br_transactions',
  categories: 'br_categories',
  recurring: 'br_recurring',
  goals: 'br_goals',
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

import { normalizeIconName } from '../design/icons.js'

const SA_CATEGORIES = [
  { name: 'Side Hustle', type: 'income', color: '#dcecfa', icon: 'briefcase', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 19 },
  { name: 'Rental Income', type: 'income', color: '#d9f3e1', icon: 'home', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 20 },
  { name: 'Stokvel Payout', type: 'income', color: '#e6e0f5', icon: 'users', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 21 },
  { name: 'Prepaid Electricity', type: 'expense', color: '#fef7d6', icon: 'zap', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 22 },
  { name: 'Water & Rates', type: 'expense', color: '#dcecfa', icon: 'droplet', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 23 },
  { name: 'Transport/Fuel', type: 'expense', color: '#ffe8d4', icon: 'truck', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 24 },
  { name: 'Taxi/Uber', type: 'expense', color: '#fde0ec', icon: 'map', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 25 },
  { name: 'Medical Aid', type: 'expense', color: '#d9f3e1', icon: 'heart', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 26 },
  { name: 'DSTV/Streaming', type: 'expense', color: '#e6e0f5', icon: 'monitor', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 27 },
  { name: 'School Fees', type: 'expense', color: '#fef7d6', icon: 'book-open', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 28 },
  { name: 'Data/Airtime', type: 'expense', color: '#dcecfa', icon: 'smartphone', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 29 },
  { name: 'Stokvel', type: 'expense', color: '#e6e0f5', icon: 'users', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 30 },
  { name: 'E-Tolls', type: 'expense', color: '#ffe8d4', icon: 'alert-circle', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 31 },
  { name: 'Domestic Worker', type: 'expense', color: '#fde0ec', icon: 'user', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 32 },
  { name: 'Banking Fees', type: 'expense', color: '#fef7d6', icon: 'credit-card', budget_limit: 0, is_active: true, rollover: false, region: 'ZA', sort_order: 33 },
]

export const DEFAULT_CATEGORIES = [
  { name: 'Salary', type: 'income', color: '#d9f3e1', icon: 'dollar-sign', budget_limit: 0, is_active: true, rollover: false, sort_order: 0 },
  { name: 'Freelance', type: 'income', color: '#dcecfa', icon: 'briefcase', budget_limit: 0, is_active: true, rollover: false, sort_order: 1 },
  { name: 'Investments', type: 'income', color: '#e6e0f5', icon: 'trending-up', budget_limit: 0, is_active: true, rollover: false, sort_order: 2 },
  { name: 'Other Income', type: 'income', color: '#fef7d6', icon: 'dollar-sign', budget_limit: 0, is_active: true, rollover: false, sort_order: 3 },
  { name: 'Housing/Rent', type: 'expense', color: '#ffe8d4', icon: 'home', budget_limit: 0, is_active: true, rollover: false, sort_order: 4 },
  { name: 'Utilities', type: 'expense', color: '#dcecfa', icon: 'zap', budget_limit: 0, is_active: true, rollover: false, sort_order: 5 },
  { name: 'Groceries', type: 'expense', color: '#d9f3e1', icon: 'shopping-cart', budget_limit: 0, is_active: true, rollover: false, sort_order: 6 },
  { name: 'Transportation', type: 'expense', color: '#e6e0f5', icon: 'truck', budget_limit: 0, is_active: true, rollover: false, sort_order: 7 },
  { name: 'Insurance', type: 'expense', color: '#fde0ec', icon: 'shield', budget_limit: 0, is_active: true, rollover: false, sort_order: 8 },
  { name: 'Healthcare', type: 'expense', color: '#fef7d6', icon: 'activity', budget_limit: 0, is_active: true, rollover: false, sort_order: 9 },
  { name: 'Entertainment', type: 'expense', color: '#ffe8d4', icon: 'film', budget_limit: 0, is_active: true, rollover: false, sort_order: 10 },
  { name: 'Dining Out', type: 'expense', color: '#fde0ec', icon: 'coffee', budget_limit: 0, is_active: true, rollover: false, sort_order: 11 },
  { name: 'Subscriptions', type: 'expense', color: '#dcecfa', icon: 'smartphone', budget_limit: 0, is_active: true, rollover: false, sort_order: 12 },
  { name: 'Clothing', type: 'expense', color: '#e6e0f5', icon: 'tag', budget_limit: 0, is_active: true, rollover: false, sort_order: 13 },
  { name: 'Education', type: 'expense', color: '#d9f3e1', icon: 'book-open', budget_limit: 0, is_active: true, rollover: false, sort_order: 14 },
  { name: 'Personal Care', type: 'expense', color: '#fef7d6', icon: 'star', budget_limit: 0, is_active: true, rollover: false, sort_order: 15 },
  { name: 'Debt Payments', type: 'expense', color: '#ffe8d4', icon: 'credit-card', budget_limit: 0, is_active: true, rollover: false, sort_order: 16 },
  { name: 'Savings', type: 'expense', color: '#d9f3e1', icon: 'archive', budget_limit: 0, is_active: true, rollover: false, sort_order: 17 },
  { name: 'Other', type: 'expense', color: '#e6e0f5', icon: 'package', budget_limit: 0, is_active: true, rollover: false, sort_order: 18 },
  ...SA_CATEGORIES,
]

function createCollection(key) {
  return {
    async getFullList(filter) {
      let items = load(key)
      if (filter) {
        items = items.filter(filter)
      }
      return items
    },

    async getOne(id) {
      const items = load(key)
      const item = items.find((i) => i.id === id)
      if (!item) throw new Error('Record not found')
      return item
    },

    async create(data) {
      const items = load(key)
      const now = new Date().toISOString()
      const record = {
        id: generateId(),
        ...data,
        created: now,
        updated: now,
      }
      items.push(record)
      save(key, items)
      return record
    },

    async update(id, data) {
      const items = load(key)
      const index = items.findIndex((i) => i.id === id)
      if (index === -1) throw new Error('Record not found')
      items[index] = {
        ...items[index],
        ...data,
        updated: new Date().toISOString(),
      }
      save(key, items)
      return items[index]
    },

    async delete(id) {
      const items = load(key)
      const filtered = items.filter((i) => i.id !== id)
      save(key, filtered)
    },
  }
}

function initDefaultCategories() {
  if (load(STORAGE_KEYS.categories).length === 0) {
    const now = new Date().toISOString()
    const categories = DEFAULT_CATEGORIES.map((cat, i) => ({
      id: generateId(),
      ...cat,
      sort_order: i,
      created: now,
      updated: now,
    }))
    save(STORAGE_KEYS.categories, categories)
  }
}

function migrateCategoryIcons() {
  const categories = load(STORAGE_KEYS.categories)
  if (!categories.length) return

  let changed = false
  const migrated = categories.map((cat) => {
    const normalized = normalizeIconName(cat.icon)
    if (normalized !== cat.icon) {
      changed = true
      return { ...cat, icon: normalized }
    }
    return cat
  })

  if (changed) save(STORAGE_KEYS.categories, migrated)
}

function migrateCategories() {
  const categories = load(STORAGE_KEYS.categories)
  if (!categories.length) return

  let changed = false
  const now = new Date().toISOString()
  const existingNames = new Set(categories.map((c) => c.name))

  const withRollover = categories.map((cat) => {
    if (cat.rollover === undefined) {
      changed = true
      return { ...cat, rollover: false }
    }
    return cat
  })

  const maxOrder = withRollover.reduce((max, c) => Math.max(max, c.sort_order ?? 0), -1)
  let nextOrder = maxOrder + 1
  const additions = []

  for (const saCat of SA_CATEGORIES) {
    if (!existingNames.has(saCat.name)) {
      changed = true
      additions.push({
        id: generateId(),
        ...saCat,
        sort_order: nextOrder++,
        created: now,
        updated: now,
      })
    }
  }

  if (changed) {
    save(STORAGE_KEYS.categories, [...withRollover, ...additions])
  }
}

function migrateRecurring() {
  const items = load(STORAGE_KEYS.recurring)
  if (!items.length) return

  let changed = false
  const migrated = items.map((item) => {
    if (item.reminder_days === undefined) {
      changed = true
      return { ...item, reminder_days: 3 }
    }
    return item
  })

  if (changed) save(STORAGE_KEYS.recurring, migrated)
}

initDefaultCategories()
migrateCategoryIcons()
migrateCategories()
migrateRecurring()

export const localDb = {
  transactions: createCollection(STORAGE_KEYS.transactions),
  categories: createCollection(STORAGE_KEYS.categories),
  recurring: createCollection(STORAGE_KEYS.recurring),
  goals: createCollection(STORAGE_KEYS.goals),
}

export function exportAllData() {
  return {
    transactions: load(STORAGE_KEYS.transactions),
    categories: load(STORAGE_KEYS.categories),
    recurring: load(STORAGE_KEYS.recurring),
    goals: load(STORAGE_KEYS.goals),
    exportedAt: new Date().toISOString(),
  }
}

export function exportToCsv(records, columns) {
  if (!records.length) return ''
  const header = columns.join(',')
  const rows = records.map((record) =>
    columns
      .map((col) => {
        const val = record[col] ?? ''
        const str = String(val)
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      })
      .join(',')
  )
  return [header, ...rows].join('\n')
}

export function downloadCsv(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
