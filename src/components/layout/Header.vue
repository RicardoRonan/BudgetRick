<script setup>
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUiStore } from '../../stores/ui.js'
import { useAuthStore } from '../../stores/auth.js'
import MonthSelector from '../budget/MonthSelector.vue'
import FeatherIcon from '../ui/FeatherIcon.vue'
import { refreshAppData } from '../../services/refreshAppData.js'

const uiStore = useUiStore()
const authStore = useAuthStore()
const router = useRouter()

const themeIcon = computed(() => {
  return uiStore.resolvedTheme === 'dark' ? 'sun' : 'moon'
})

const themeTitle = computed(() => {
  return uiStore.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
})

const sidebarToggleIcon = computed(() => {
  if (uiStore.sidebarCollapsed) return 'chevron-right'
  return 'menu'
})

const sidebarToggleLabel = computed(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
    return uiStore.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
  }
  return 'Open menu'
})

function handleSidebarToggle() {
  if (window.matchMedia('(min-width: 1024px)').matches) {
    uiStore.toggleSidebarCollapsed()
  } else {
    uiStore.toggleSidebar()
  }
}

async function handleSignOut() {
  await authStore.signOut()
  await refreshAppData()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-20 shrink-0 bg-transparent pointer-events-none px-3 py-2 lg:px-6 lg:pb-3">
    <!-- Mobile -->
    <div class="flex flex-col gap-2 lg:hidden pointer-events-auto">
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="nav-floating-pill nav-pill-btn shrink-0"
          :aria-label="sidebarToggleLabel"
          @click="handleSidebarToggle"
        >
          <FeatherIcon name="menu" :size="18" />
        </button>
        <div class="nav-floating-pill shrink-0">
          <RouterLink
            v-if="authStore.isConfigured && !authStore.isLoggedIn"
            to="/login"
            class="nav-pill-text-btn"
          >
            Sign in
          </RouterLink>
          <button
            v-if="authStore.isConfigured && authStore.isLoggedIn"
            type="button"
            class="nav-pill-btn"
            aria-label="Sign out"
            @click="handleSignOut"
          >
            <FeatherIcon name="log-out" :size="18" />
          </button>
          <button
            type="button"
            class="nav-pill-btn"
            :title="themeTitle"
            @click="uiStore.toggleTheme()"
          >
            <FeatherIcon :name="themeIcon" :size="18" />
          </button>
        </div>
      </div>
      <div class="flex justify-center">
        <MonthSelector />
      </div>
    </div>

    <!-- Desktop -->
    <div class="hidden lg:flex items-center justify-between gap-4 pointer-events-auto">
      <div class="flex items-center gap-2 min-w-0">
        <button
          type="button"
          class="nav-floating-pill nav-pill-btn shrink-0"
          :aria-label="sidebarToggleLabel"
          @click="handleSidebarToggle"
        >
          <FeatherIcon :name="sidebarToggleIcon" :size="18" />
        </button>
        <MonthSelector />
      </div>
      <div class="nav-floating-pill shrink-0">
        <RouterLink
          v-if="authStore.isConfigured && !authStore.isLoggedIn"
          to="/login"
          class="nav-pill-text-btn"
        >
          Sign in
        </RouterLink>
        <button
          v-if="authStore.isConfigured && authStore.isLoggedIn"
          type="button"
          class="nav-pill-text-btn"
          @click="handleSignOut"
        >
          Sign out
        </button>
        <button
          type="button"
          class="nav-pill-btn"
          :title="themeTitle"
          @click="uiStore.toggleTheme()"
        >
          <FeatherIcon :name="themeIcon" :size="18" />
        </button>
      </div>
    </div>
  </header>
</template>
