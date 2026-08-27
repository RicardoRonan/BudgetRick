<script setup>
import { ref, computed } from 'vue'
import NotionButton from '../ui/NotionButton.vue'
import NotionModal from '../ui/NotionModal.vue'
import { useCategoriesStore } from '../../stores/categories.js'
import { useRecurringStore } from '../../stores/recurring.js'
import { useTransactionsStore } from '../../stores/transactions.js'
import { useCurrency } from '../../composables/useCurrency.js'
import {
  readNotionFile,
  parseNotionCsv,
  importNotionPreviewRows,
  postRecurringAsTransactions,
} from '../../services/notionImport.js'
import { syncBudgetLimitsFromRecurring } from '../../services/budgetSync.js'

const categoriesStore = useCategoriesStore()
const recurringStore = useRecurringStore()
const transactionsStore = useTransactionsStore()
const { formatCurrency } = useCurrency()

const fileInput = ref(null)
const showPreview = ref(false)
const previewRows = ref([])
const fileName = ref('')
const loading = ref(false)
const importing = ref(false)
const postingTransactions = ref(false)
const error = ref('')
const resultMessage = ref('')

const readyCount = computed(() => previewRows.value.filter((row) => row.status === 'ready').length)
const duplicateCount = computed(() => previewRows.value.filter((row) => row.status === 'duplicate').length)
const skipCount = computed(() => previewRows.value.filter((row) => row.status === 'skip').length)
const errorCount = computed(() => previewRows.value.filter((row) => row.status === 'error').length)

function statusClass(status) {
  switch (status) {
    case 'ready':
      return 'text-success'
    case 'duplicate':
    case 'skip':
      return 'text-steel'
    case 'error':
      return 'text-error'
    default:
      return 'text-charcoal'
  }
}

function openFilePicker() {
  error.value = ''
  resultMessage.value = ''
  fileInput.value?.click()
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  loading.value = true
  error.value = ''
  resultMessage.value = ''

  try {
    const csvText = await readNotionFile(file)
    fileName.value = file.name
    previewRows.value = parseNotionCsv(
      csvText,
      categoriesStore.categories,
      recurringStore.recurring
    )
    showPreview.value = true
  } catch (err) {
    const message = err.message || 'Could not read the uploaded file'
    if (message.includes('ReadableStream') || message.includes('aborted')) {
      error.value = 'Could not read the zip file. Extract the CSV and upload it directly.'
    } else {
      error.value = message
    }
  } finally {
    loading.value = false
  }
}

async function runImport() {
  if (!readyCount.value) return

  importing.value = true
  error.value = ''

  try {
    const results = await importNotionPreviewRows(previewRows.value, {
      categories: categoriesStore.categories,
      createCategory: (data) => categoriesStore.createCategory(data),
      createRecurring: (data) => recurringStore.createRecurring(data),
      createTransaction: (data) => transactionsStore.createTransaction(data),
      postTransactions: true,
    })

    const budgetSync = await syncBudgetLimitsFromRecurring(
      recurringStore.recurring,
      categoriesStore.categories,
      (id, data) => categoriesStore.updateCategory(id, data)
    )

    resultMessage.value = `Imported ${results.imported} recurring bill${results.imported === 1 ? '' : 's'}.`
    if (results.transactionsCreated) {
      resultMessage.value += ` Added ${results.transactionsCreated} transaction${results.transactionsCreated === 1 ? '' : 's'} for this month.`
    }
    if (budgetSync.updated) {
      resultMessage.value += ` Updated ${budgetSync.updated} budget limit${budgetSync.updated === 1 ? '' : 's'}.`
    }
    if (results.categoriesCreated) {
      resultMessage.value += ` Created ${results.categoriesCreated} categor${results.categoriesCreated === 1 ? 'y' : 'ies'}.`
    }
    if (results.skipped) {
      resultMessage.value += ` Skipped ${results.skipped}.`
    }
    if (results.errors.length) {
      resultMessage.value += ` ${results.errors.length} failed.`
    }

    showPreview.value = false
    previewRows.value = []
    fileName.value = ''
  } catch (err) {
    error.value = err.message || 'Import failed'
  } finally {
    importing.value = false
  }
}

async function postThisMonthTransactions() {
  if (!recurringStore.recurring.length) return

  postingTransactions.value = true
  error.value = ''
  resultMessage.value = ''

  try {
    const result = await postRecurringAsTransactions(
      recurringStore.recurring,
      transactionsStore.transactions,
      categoriesStore.categories,
      (data) => transactionsStore.createTransaction(data)
    )

    if (result.created) {
      resultMessage.value = `Added ${result.created} transaction${result.created === 1 ? '' : 's'} for ${result.monthDate.slice(0, 7)}.`
      if (result.skipped) {
        resultMessage.value += ` Skipped ${result.skipped} (already posted or inactive).`
      }
    } else {
      resultMessage.value = 'All recurring bills already have transactions for this month.'
    }
  } catch (err) {
    error.value = err.message || 'Could not create transactions'
  } finally {
    postingTransactions.value = false
  }
}
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept=".csv,.zip"
      class="hidden"
      @change="handleFileChange"
    />

    <p class="text-sm text-steel mb-4">
      Upload a Notion CSV export to import recurring monthly bills, map labels to categories, and add this month's transactions.
    </p>

    <div class="flex flex-col sm:flex-row gap-2">
      <NotionButton variant="secondary" :disabled="loading" @click="openFilePicker">
        {{ loading ? 'Reading file...' : 'Choose file' }}
      </NotionButton>
      <NotionButton
        variant="secondary"
        :disabled="postingTransactions || !recurringStore.recurring.length"
        @click="postThisMonthTransactions"
      >
        {{ postingTransactions ? 'Creating...' : 'Post this month to Transactions' }}
      </NotionButton>
    </div>

    <p v-if="error" class="text-sm text-error mt-3">{{ error }}</p>
    <p v-if="resultMessage" class="text-sm text-success mt-3">{{ resultMessage }}</p>

    <NotionModal v-model="showPreview" title="Import from Notion">
      <div class="space-y-4">
        <p class="text-sm text-steel">
          Preview for <span class="text-charcoal font-medium">{{ fileName }}</span>
        </p>

        <div class="flex flex-wrap gap-3 text-xs text-steel">
          <span>{{ readyCount }} ready</span>
          <span>{{ duplicateCount }} duplicates</span>
          <span>{{ skipCount }} empty</span>
          <span v-if="errorCount">{{ errorCount }} errors</span>
        </div>

        <div class="border border-hairline rounded-notion overflow-x-auto max-h-[50vh] overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="bg-surface sticky top-0">
              <tr>
                <th class="text-left py-2 px-3 font-medium text-steel">Name</th>
                <th class="text-left py-2 px-3 font-medium text-steel">Amount</th>
                <th class="text-left py-2 px-3 font-medium text-steel">Category</th>
                <th class="text-left py-2 px-3 font-medium text-steel">Frequency</th>
                <th class="text-left py-2 px-3 font-medium text-steel">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in previewRows"
                :key="index"
                class="border-t border-hairline"
              >
                <td class="py-2 px-3 text-charcoal">{{ row.name || '—' }}</td>
                <td class="py-2 px-3 text-charcoal">
                  {{ row.amount != null ? formatCurrency(row.amount) : '—' }}
                </td>
                <td class="py-2 px-3 text-charcoal">
                  {{ row.categoryName || '—' }}
                  <span v-if="row.categoryWillCreate" class="text-xs text-steel"> (new)</span>
                </td>
                <td class="py-2 px-3 text-steel capitalize">{{ row.frequency }}</td>
                <td class="py-2 px-3" :class="statusClass(row.status)">{{ row.statusMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <NotionButton variant="secondary" type="button" @click="showPreview = false">
            Cancel
          </NotionButton>
          <NotionButton
            type="button"
            :disabled="!readyCount || importing"
            @click="runImport"
          >
            {{ importing ? 'Importing...' : `Import ${readyCount} bill${readyCount === 1 ? '' : 's'}` }}
          </NotionButton>
        </div>
      </div>
    </NotionModal>
  </div>
</template>
