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
const notice = ref('')

async function handleSubmit() {
  if (!email.value || !password.value) return
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    const data = await authStore.signUp(email.value.trim(), password.value)
    if (data.session) {
      await refreshAppData()
      router.push('/')
    } else {
      notice.value = 'Check your email to confirm your account, then sign in.'
    }
  } catch (err) {
    error.value = err.message || 'Could not create account'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4">
    <NotionCard class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal">Create account</h1>
        <p class="text-sm text-steel mt-1">Start budgeting on laptop and phone</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <NotionInput v-model="email" label="Email" type="email" placeholder="you@example.com" />
        <NotionInput v-model="password" label="Password" type="password" placeholder="At least 6 characters" />

        <p v-if="error" class="text-sm text-error">{{ error }}</p>
        <p v-if="notice" class="text-sm text-success">{{ notice }}</p>

        <NotionButton type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </NotionButton>
      </form>

      <p class="text-sm text-steel text-center mt-6">
        Already have an account?
        <router-link to="/login" class="text-primary hover:underline">Sign in</router-link>
      </p>
    </NotionCard>
  </div>
</template>
