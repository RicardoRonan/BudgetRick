<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import AppShell from './components/layout/AppShell.vue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'

const route = useRoute()

const showShell = computed(() => !route.meta.public)
</script>

<template>
  <AppShell v-if="showShell">
    <RouterView />
  </AppShell>
  <RouterView v-else />
  <ConfirmDialog />
</template>
