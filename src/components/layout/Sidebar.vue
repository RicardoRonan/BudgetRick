<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { NAV_ICONS } from '../../design/icons.js'
import { useBillReminders } from '../../composables/useBillReminders.js'
import { useUiStore } from '../../stores/ui.js'

const route = useRoute()
const uiStore = useUiStore()
const { reminderCount } = useBillReminders()

const navItems = [
  { to: '/', label: 'Dashboard', icon: NAV_ICONS.dashboard },
  { to: '/budget', label: 'Budget', icon: NAV_ICONS.budget },
  { to: '/transactions', label: 'Transactions', icon: NAV_ICONS.transactions },
  { to: '/goals', label: 'Goals', icon: NAV_ICONS.goals },
  { to: '/recurring', label: 'Recurring', icon: NAV_ICONS.recurring, showBadge: true },
  { to: '/settings', label: 'Settings', icon: NAV_ICONS.settings },
]

function isLgScreen() {
  return window.matchMedia('(min-width: 1024px)').matches
}

function onEscape(e) {
  if (e.key === 'Escape' && uiStore.sidebarOpen) {
    uiStore.closeSidebar()
  }
}

watch(() => route.path, () => {
  if (!isLgScreen()) {
    uiStore.closeSidebar()
  }
})

watch(() => uiStore.sidebarOpen, (open) => {
  if (!isLgScreen()) {
    document.body.classList.toggle('overflow-hidden', open)
  }
})

onMounted(() => {
  document.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
  document.body.classList.remove('overflow-hidden')
})
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition name="fade">
    <div
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      @click="uiStore.closeSidebar()"
    />
  </Transition>

  <!-- Mobile drawer -->
  <aside
    class="fixed inset-y-0 left-0 z-50 w-64 bg-canvas border-r border-hairline flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden"
    :class="uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-16 px-4 border-b border-hairline flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-lg font-bold text-charcoal">BudgetRick</h1>
        <p class="text-xs text-steel mt-0.5">Personal finance, simplified</p>
      </div>
      <button
        type="button"
        class="p-2 rounded-notion text-steel hover:bg-surface hover:text-charcoal transition-colors"
        aria-label="Close menu"
        @click="uiStore.closeSidebar()"
      >
        <FeatherIcon name="x" :size="18" />
      </button>
    </div>
    <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] text-sm rounded-notion transition-colors"
        :class="route.path === item.to
          ? 'bg-surface text-charcoal font-medium'
          : 'text-steel hover:bg-surface hover:text-charcoal'"
      >
        <FeatherIcon :name="item.icon" :size="16" />
        <span class="flex-1">{{ item.label }}</span>
        <span
          v-if="item.showBadge && reminderCount > 0"
          class="min-w-5 h-5 px-1 flex items-center justify-center text-xs font-medium rounded-notion-sm bg-error text-white"
        >
          {{ reminderCount > 9 ? '9+' : reminderCount }}
        </span>
      </RouterLink>
    </nav>
  </aside>

  <!-- Desktop sidebar -->
  <aside
    class="hidden lg:flex shrink-0 border-r border-hairline bg-canvas flex-col transition-[width] duration-200 ease-in-out"
    :class="uiStore.sidebarCollapsed ? 'w-16' : 'w-56'"
  >
    <div
      class="h-16 border-b border-hairline flex items-center shrink-0 overflow-hidden"
      :class="uiStore.sidebarCollapsed ? 'justify-center px-2' : 'px-4'"
    >
      <div class="min-w-0" :class="uiStore.sidebarCollapsed ? 'text-center' : ''">
        <h1
          class="font-bold text-charcoal leading-tight"
          :class="uiStore.sidebarCollapsed ? 'text-sm' : 'text-base'"
        >
          {{ uiStore.sidebarCollapsed ? 'BR' : 'BudgetRick' }}
        </h1>
        <p v-if="!uiStore.sidebarCollapsed" class="text-xs text-steel mt-0.5 truncate">
          Personal finance, simplified
        </p>
      </div>
    </div>
    <nav class="flex-1 p-2 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :title="uiStore.sidebarCollapsed ? item.label : undefined"
        class="relative flex items-center min-h-[44px] text-sm rounded-notion transition-colors"
        :class="[
          uiStore.sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5',
          route.path === item.to
            ? 'bg-surface text-charcoal font-medium'
            : 'text-steel hover:bg-surface hover:text-charcoal',
        ]"
      >
        <FeatherIcon :name="item.icon" :size="16" />
        <span v-if="!uiStore.sidebarCollapsed" class="flex-1 truncate">{{ item.label }}</span>
        <span
          v-if="item.showBadge && reminderCount > 0 && !uiStore.sidebarCollapsed"
          class="min-w-5 h-5 px-1 flex items-center justify-center text-xs font-medium rounded-notion-sm bg-error text-white"
        >
          {{ reminderCount > 9 ? '9+' : reminderCount }}
        </span>
        <span
          v-if="item.showBadge && reminderCount > 0 && uiStore.sidebarCollapsed"
          class="absolute top-1.5 right-1.5 min-w-4 h-4 px-0.5 flex items-center justify-center text-[10px] font-medium rounded-full bg-error text-white"
        >
          {{ reminderCount > 9 ? '9+' : reminderCount }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
