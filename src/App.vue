<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import AppShell from './components/layout/AppShell.vue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'
import { useAuthStore } from './stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const showShell = computed(() => {
  if (route.meta.public) return false
  if (!authStore.isConfigured) return true
  return authStore.isLoggedIn
})
</script>

<template>
  <AppShell v-if="showShell">
    <RouterView />
  </AppShell>
  <RouterView v-else />
  <ConfirmDialog />
</template>
