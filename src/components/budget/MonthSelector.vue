<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { useUiStore } from '../../stores/ui.js'
import { format, addMonths, startOfMonth, subMonths, isSameMonth } from 'date-fns'
import FeatherIcon from '../ui/FeatherIcon.vue'

const uiStore = useUiStore()

const pickerOpen = ref(false)
const anchorRef = ref(null)
const listRef = ref(null)
const flyoutStyle = ref({ top: '0px', left: '0px', width: '240px' })

const MONTHS_PAST = 48
const MONTHS_FUTURE = 12
const FLYOUT_WIDTH = 240

const monthLong = computed(() => format(uiStore.selectedMonth, 'MMMM yyyy'))
const monthShort = computed(() => format(uiStore.selectedMonth, 'MMM yyyy'))

const monthOptions = computed(() => {
  const anchor = startOfMonth(new Date())
  const start = subMonths(anchor, MONTHS_PAST)
  const total = MONTHS_PAST + MONTHS_FUTURE + 1
  return Array.from({ length: total }, (_, i) => addMonths(start, i))
})

function selectMonth(date) {
  uiStore.setMonth(date)
  pickerOpen.value = false
}

function pickToday() {
  uiStore.setMonth(new Date())
  pickerOpen.value = false
}

function closePicker() {
  pickerOpen.value = false
}

function updateFlyoutPosition() {
  const el = anchorRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const margin = 16
  let left = rect.left
  const maxLeft = window.innerWidth - FLYOUT_WIDTH - margin
  left = Math.min(left, maxLeft)
  left = Math.max(margin, left)

  flyoutStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${left}px`,
    width: `${FLYOUT_WIDTH}px`,
  }
}

async function openPicker() {
  pickerOpen.value = true
  await nextTick()
  updateFlyoutPosition()
  const selected = listRef.value?.querySelector('[data-selected="true"]')
  selected?.scrollIntoView({ block: 'center' })
}

function onEscape(e) {
  if (e.key === 'Escape') closePicker()
}

function onResize() {
  if (pickerOpen.value) updateFlyoutPosition()
}

watch(pickerOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onEscape)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
  } else {
    document.removeEventListener('keydown', onEscape)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', onResize, true)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>

<template>
  <div ref="anchorRef" class="nav-floating-pill max-w-full">
    <button
      type="button"
      class="nav-pill-btn shrink-0"
      aria-label="Previous month"
      @click="uiStore.prevMonth()"
    >
      <FeatherIcon name="chevron-left" :size="18" />
    </button>
    <button
      type="button"
      class="text-sm font-semibold text-charcoal text-center whitespace-nowrap px-0.5 min-w-[72px] sm:min-w-[112px] truncate rounded-full hover:bg-surface/80 transition-colors py-1"
      :title="monthLong"
      aria-label="Choose month"
      @click="openPicker"
    >
      <span class="sm:hidden">{{ monthShort }}</span>
      <span class="hidden sm:inline">{{ monthLong }}</span>
    </button>
    <button
      type="button"
      class="nav-pill-btn shrink-0"
      aria-label="Next month"
      @click="uiStore.nextMonth()"
    >
      <FeatherIcon name="chevron-right" :size="18" />
    </button>
    <button
      type="button"
      class="nav-pill-btn shrink-0"
      aria-label="Choose month"
      @click="openPicker"
    >
      <FeatherIcon name="calendar" :size="16" />
    </button>
    <button
      type="button"
      class="nav-pill-text-btn shrink-0 hidden sm:inline-flex"
      @click="uiStore.setMonth(new Date())"
    >
      Today
    </button>
  </div>

  <Teleport to="body">
    <Transition name="month-flyout">
      <div
        v-if="pickerOpen"
        class="fixed inset-0 z-50"
        @click="closePicker"
      >
        <div
          class="fixed z-50 bg-canvas border border-hairline rounded-notion-lg shadow-xl overflow-hidden"
          :style="flyoutStyle"
          @click.stop
        >
          <div class="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-hairline">
            <span class="text-sm font-semibold text-charcoal">Select month</span>
            <button
              type="button"
              class="text-xs font-medium text-primary hover:underline shrink-0"
              @click="pickToday"
            >
              Today
            </button>
          </div>
          <div
            ref="listRef"
            class="max-h-[min(60vh,360px)] overflow-y-auto p-1"
          >
            <button
              v-for="month in monthOptions"
              :key="month.toISOString()"
              type="button"
              :data-selected="isSameMonth(month, uiStore.selectedMonth)"
              class="w-full text-left px-3 py-2 min-h-[40px] text-sm rounded-notion transition-colors"
              :class="isSameMonth(month, uiStore.selectedMonth)
                ? 'bg-surface text-charcoal font-medium'
                : 'text-steel hover:bg-surface hover:text-charcoal'"
              @click="selectMonth(month)"
            >
              {{ format(month, 'MMMM yyyy') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.month-flyout-enter-active,
.month-flyout-leave-active {
  transition: opacity 0.15s ease;
}

.month-flyout-enter-active > div:last-child,
.month-flyout-leave-active > div:last-child {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.month-flyout-enter-from,
.month-flyout-leave-to {
  opacity: 0;
}

.month-flyout-enter-from > div:last-child,
.month-flyout-leave-to > div:last-child {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
