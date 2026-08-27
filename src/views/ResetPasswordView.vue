<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NotionCard from '../components/ui/NotionCard.vue'
import NotionInput from '../components/ui/NotionInput.vue'
import NotionButton from '../components/ui/NotionButton.vue'
import { supabase } from '../composables/useSupabase.js'
import { useAuthStore } from '../stores/auth.js'
import { refreshAppData } from '../services/refreshAppData.js'

const router = useRouter()
const authStore = useAuthStore()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const ready = ref(false)
const error = ref('')
const notice = ref('')

onMounted(async () => {
  if (!supabase) return

  const { data: { session } } = await supabase.auth.getSession()
  if (session || authStore.recoveryMode) {
    ready.value = true
    return
  }

  const hash = window.location.hash
  if (hash.includes('type=recovery') || hash.includes('access_token')) {
    ready.value = true
  }
})

async function handleSubmit() {
  if (!newPassword.value) return
  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  notice.value = ''

  try {
    await authStore.updatePassword(newPassword.value)
    notice.value = 'Password updated. Redirecting...'
    await refreshAppData()
    setTimeout(() => router.push('/'), 800)
  } catch (err) {
    error.value = err.message || 'Could not update password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4">
    <NotionCard class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-charcoal">Set new password</h1>
        <p class="text-sm text-steel mt-1">Enter a new password for your account</p>
      </div>

      <div v-if="!ready" class="text-sm text-steel text-center py-4">
        Open this page from the link in your reset email.
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <NotionInput
          v-model="newPassword"
          label="New password"
          type="password"
          placeholder="At least 6 characters"
        />
        <NotionInput
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat password"
        />

        <p v-if="error" class="text-sm text-error">{{ error }}</p>
        <p v-if="notice" class="text-sm text-success">{{ notice }}</p>

        <NotionButton type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save new password' }}
        </NotionButton>
      </form>

      <p class="text-sm text-steel text-center mt-6">
        <router-link to="/login" class="text-primary hover:underline">Back to sign in</router-link>
      </p>
    </NotionCard>
  </div>
</template>
