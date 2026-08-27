<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NotionCard from '../components/ui/NotionCard.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import { useAuthStore } from '../stores/auth.js'
import { refreshAppData } from '../services/refreshAppData.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!email.value || !password.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.signIn(email.value.trim(), password.value)
    await refreshAppData()
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Could not sign in'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4">
    <NotionCard class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal">BudgetRick</h1>
        <p class="text-sm text-steel mt-1">Sign in to sync your budget</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <NotionInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
        <NotionInput v-model="password" label="Password" type="password" placeholder="Your password" />

        <p class="text-xs text-steel text-right">
          <router-link to="/forgot-password" class="text-primary hover:underline">Forgot password?</router-link>
        </p>

        <p v-if="error" class="text-sm text-error">{{ error }}</p>

        <NotionButton type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </NotionButton>
      </form>

      <p class="text-sm text-steel text-center mt-6">
        No account?
        <router-link to="/register" class="text-primary hover:underline">Create one</router-link>
      </p>
    </NotionCard>
  </div>
</template>
