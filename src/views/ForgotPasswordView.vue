<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NotionCard from '../components/ui/NotionCard.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)
const error = ref('')
const notice = ref('')

async function handleSubmit() {
  if (!email.value.trim()) return

  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    await authStore.resetPasswordForEmail(email.value.trim())
    notice.value = 'If that email exists, a reset link is on its way. Check your inbox.'
  } catch (err) {
    error.value = err.message || 'Could not send reset email'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4">
    <NotionCard class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal">Reset password</h1>
        <p class="text-sm text-steel mt-1">We will email you a reset link</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <NotionInput v-model="email" label="Email" type="email" placeholder="you@example.com" />

        <p v-if="error" class="text-sm text-error">{{ error }}</p>
        <p v-if="notice" class="text-sm text-success">{{ notice }}</p>

        <NotionButton type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </NotionButton>
      </form>

      <p class="text-sm text-steel text-center mt-6">
        <router-link to="/login" class="text-primary hover:underline">Back to sign in</router-link>
      </p>
    </NotionCard>
  </div>
</template>
