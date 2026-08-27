import { format, startOfMonth, addMonths } from 'date-fns'
import { categoryTints } from '../design/colors.js'
import { extractCsvFromZipBuffer } from '../lib/zipCsv.js'

const INCOME_CATEGORY_NAMES = new Set([
  'salary',
  'freelance',
  'investments',
  'other income',
  'side hustle',
  'rental income',
  'stokvel payout',
])

const NOTION_COLUMNS = ['name', 'type', 'amount', 'label', 'account', 'paid']

const LABEL_ALIASES = {
  salary: 'Salary',
  'salary deposit': 'Salary',
  contract: 'Freelance',
  freelance: 'Freelance',
  housing: 'Housing/Rent',
  rent: 'Housing/Rent',
  investment: 'Investments',
  investments: 'Investments',
  utilities: 'Utilities',
  utility: 'Utilities',
  groceries: 'Groceries',
  grocery: 'Groceries',
  subscriptions: 'Subscriptions',
  subscription: 'Subscriptions',
  streaming: 'DSTV/Streaming',
  transport: 'Transportation',
  transportation: 'Transportation',
  insurance: 'Insurance',
  healthcare: 'Healthcare',
  medical: 'Medical Aid',
  entertainment: 'Entertainment',
  dining: 'Dining Out',
  debt: 'Debt Payments',
  'credit card': 'Debt Payments',
  savings: 'Savings',
  other: 'Other',
  wifi: 'Data/Airtime',
  internet: 'Data/Airtime',
  electricity: 'Prepaid Electricity',
  electric: 'Prepaid Electricity',
  gas: 'Utilities',
  netflix: 'DSTV/Streaming',
  spotify: 'DSTV/Streaming',
  'uber one': 'Taxi/Uber',
  uber: 'Taxi/Uber',
  funeral: 'Insurance',
  'funeral cover': 'Insurance',
  mobicred: 'Debt Payments',
  tablet: 'Debt Payments',
  'platinum life': 'Insurance',
}

export function parseCsv(text) {
  const cleaned = text.replace(/^\uFEFF/, '')
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i]

    if (inQuotes) {
      if (ch === '"') {
        if (cleaned[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || (ch === '\r' && cleaned[i + 1] === '\n')) {
      if (ch === '\r') i++
      row.push(field)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }

  if (field || row.length) {
    row.push(field)
    if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  }

  return rows
}

export function parseNotionAmount(raw) {
  if (raw == null || raw === '') return null

  let value = String(raw).trim()
  value = value.replace(/ZAR|R\s*/gi, '').trim()
  value = value.replace(/\u00a0/g, ' ').replace(/\s/g, '')

  if (/,\d{1,2}$/.test(value) && !value.includes('.')) {
    value = value.replace(/\./g, '').replace(',', '.')
  } else {
    value = value.replace(/,/g, '')
  }

  const amount = parseFloat(value)
  return Number.isFinite(amount) ? amount : null
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function mapHeaderRow(headers) {
  const indexByKey = {}
  headers.forEach((header, index) => {
    const key = normalizeKey(header)
    const match = NOTION_COLUMNS.find((col) => col === key || key.includes(col))
    if (match) indexByKey[match] = index
  })
  return indexByKey
}

function rowsToObjects(rows) {
  if (!rows.length) return []

  const [headerRow, ...dataRows] = rows
  const indexByKey = mapHeaderRow(headerRow)

  return dataRows.map((cells) => {
    const record = {}
    for (const key of NOTION_COLUMNS) {
      const index = indexByKey[key]
      record[key] = index == null ? '' : (cells[index] ?? '').trim()
    }
    return record
  })
}

function resolveCategoryName(label, name) {
  const labelKey = normalizeKey(label)
  const nameKey = normalizeKey(name)

  if (LABEL_ALIASES[labelKey]) return LABEL_ALIASES[labelKey]
  if (LABEL_ALIASES[nameKey]) return LABEL_ALIASES[nameKey]

  if (labelKey) {
    const partial = Object.entries(LABEL_ALIASES).find(([alias]) => labelKey.includes(alias) || alias.includes(labelKey))
    if (partial) return partial[1]
  }

  if (labelKey) return label.trim()
  if (nameKey) return name.trim()
  return 'Other'
}

function findCategoryByName(categories, categoryName) {
  const target = normalizeKey(categoryName)
  return categories.find((category) => normalizeKey(category.name) === target)
}

function isBlankRow(record) {
  return !record.name && !record.amount && !record.label
}

function isDuplicate(existingRecurring, name, amount) {
  const normalizedName = normalizeKey(name)
  return existingRecurring.some(
    (item) => normalizeKey(item.name) === normalizedName && Number(item.amount) === Number(amount)
  )
}

function inferCategoryType(categoryName) {
  return INCOME_CATEGORY_NAMES.has(normalizeKey(categoryName)) ? 'income' : 'expense'
}

export function buildNotionImportPreview(records, categories, existingRecurring) {
  const nextDate = format(startOfMonth(addMonths(new Date(), 1)), 'yyyy-MM-dd')

  return records.map((record) => {
    if (isBlankRow(record)) {
      return {
        source: record,
        name: '',
        amount: null,
        frequency: 'monthly',
        categoryName: '',
        categoryType: 'expense',
        categoryId: null,
        categoryWillCreate: false,
        next_date: nextDate,
        status: 'skip',
        statusMessage: 'Empty row',
      }
    }

    const amount = parseNotionAmount(record.amount)
    const categoryName = resolveCategoryName(record.label, record.name)
    const matchedCategory = findCategoryByName(categories, categoryName)
    const categoryType = matchedCategory?.type || inferCategoryType(categoryName)

    if (!record.name) {
      return {
        source: record,
        name: '',
        amount,
        frequency: 'monthly',
        categoryName,
        categoryType,
        categoryId: matchedCategory?.id || null,
        categoryWillCreate: !matchedCategory,
        next_date: nextDate,
        status: 'error',
        statusMessage: 'Missing name',
      }
    }

    if (amount == null || amount <= 0) {
      return {
        source: record,
        name: record.name,
        amount,
        frequency: 'monthly',
        categoryName,
        categoryType,
        categoryId: matchedCategory?.id || null,
        categoryWillCreate: !matchedCategory,
        next_date: nextDate,
        status: 'error',
        statusMessage: 'Invalid amount',
      }
    }

    if (isDuplicate(existingRecurring, record.name, amount)) {
      return {
        source: record,
        name: record.name,
        amount,
        frequency: 'monthly',
        categoryName,
        categoryType,
        categoryId: matchedCategory?.id || null,
        categoryWillCreate: !matchedCategory,
        next_date: nextDate,
        status: 'duplicate',
        statusMessage: 'Already exists',
      }
    }

    return {
      source: record,
      name: record.name,
      amount,
      frequency: 'monthly',
      categoryName,
      categoryType,
      categoryId: matchedCategory?.id || null,
      categoryWillCreate: !matchedCategory,
      next_date: nextDate,
      status: 'ready',
      statusMessage: matchedCategory ? 'Ready' : 'New category',
    }
  })
}

export function parseNotionCsv(csvText, categories, existingRecurring) {
  const rows = parseCsv(csvText)
  const records = rowsToObjects(rows)
  return buildNotionImportPreview(records, categories, existingRecurring)
}

export async function extractCsvFromZip(file) {
  try {
    const buffer = await file.arrayBuffer()
    return await extractCsvFromZipBuffer(buffer)
  } catch {
    throw new Error('Could not open zip file. Extract the CSV from the archive and upload it directly.')
  }
}

export async function readNotionFile(file) {
  const lowerName = file.name.toLowerCase()
  if (lowerName.endsWith('.csv')) {
    return file.text()
  }
  if (lowerName.endsWith('.zip')) {
    return extractCsvFromZip(file)
  }
  throw new Error('Upload a Notion .csv export or .zip archive')
}

function inferTransactionType(row, categoryType) {
  const sourceType = normalizeKey(row?.source?.type)
  if (sourceType === 'income') return 'income'
  if (categoryType === 'income') return 'income'
  return 'expense'
}

function transactionTypeForCategory(categories, categoryId) {
  const category = categories.find((entry) => entry.id === categoryId)
  return category?.type === 'income' ? 'income' : 'expense'
}

export async function postRecurringAsTransactions(
  recurring,
  transactions,
  categories,
  createTransaction,
  options = {}
) {
  const monthDate = options.monthDate || format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const monthPrefix = monthDate.slice(0, 7)
  let created = 0
  let skipped = 0

  for (const item of recurring) {
    if (!item.is_active) {
      skipped++
      continue
    }

    const alreadyPosted = transactions.some(
      (transaction) =>
        transaction.recurring_id === item.id && transaction.date?.startsWith(monthPrefix)
    )
    if (alreadyPosted) {
      skipped++
      continue
    }

    await createTransaction({
      date: monthDate,
      type: transactionTypeForCategory(categories, item.category_id),
      amount: item.amount,
      category_id: item.category_id,
      description: item.name,
      is_recurring: true,
      recurring_id: item.id,
    })
    created++
  }

  return { created, skipped, monthDate }
}

export async function importNotionPreviewRows(
  rows,
  { categories, createCategory, createRecurring, createTransaction, postTransactions = true }
) {
  const categoryCache = new Map(
    categories.map((category) => [normalizeKey(category.name), category])
  )

  const results = {
    imported: 0,
    skipped: 0,
    categoriesCreated: 0,
    transactionsCreated: 0,
    errors: [],
  }

  const transactionDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  for (const row of rows) {
    if (row.status !== 'ready') {
      results.skipped++
      continue
    }

    try {
      let categoryId = row.categoryId
      if (!categoryId) {
        const cacheKey = normalizeKey(row.categoryName)
        let category = categoryCache.get(cacheKey)

        if (!category) {
          const tintIndex = categoryCache.size % categoryTints.length
          category = await createCategory({
            name: row.categoryName,
            type: row.categoryType,
            color: categoryTints[tintIndex],
            icon: 'package',
            budget_limit: 0,
            rollover: false,
          })
          categoryCache.set(cacheKey, category)
          results.categoriesCreated++
        }

        categoryId = category.id
      }

      const recurringRecord = await createRecurring({
        name: row.name,
        amount: row.amount,
        category_id: categoryId,
        frequency: row.frequency,
        next_date: row.next_date,
        notes: row.source?.account ? `Account: ${row.source.account}` : '',
      })

      if (postTransactions && createTransaction) {
        await createTransaction({
          date: transactionDate,
          type: inferTransactionType(row, row.categoryType),
          amount: row.amount,
          category_id: categoryId,
          description: row.name,
          is_recurring: true,
          recurring_id: recurringRecord.id,
        })
        results.transactionsCreated++
      }

      results.imported++
    } catch (error) {
      results.errors.push({ name: row.name, message: error.message })
    }
  }

  return results
}
