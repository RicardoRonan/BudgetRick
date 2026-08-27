<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import NotionInput from '../ui/NotionInput.vue'
import NotionButton from '../ui/NotionButton.vue'
import NotionBadge from '../ui/NotionBadge.vue'
import { useAuthStore } from '../../stores/auth.js'
import { refreshAppData } from '../../services/refreshAppData.js'

const router = useRouter()
const authStore = useAuthStore()

const newEmail = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const emailLoading = ref(false)
const passwordLoading = ref(false)
const verifyLoading = ref(false)
const signOutLoading = ref(false)

const emailMessage = ref('')
const passwordMessage = ref('')
const verifyMessage = ref('')

const memberSince = computed(() => {
  if (!authStore.userCreatedAt) return ''
  return format(parseISO(authStore.userCreatedAt), 'MMM d, yyyy')
})

const lastSignIn = computed(() => {
  if (!authStore.lastSignInAt) return ''
  return format(parseISO(authStore.lastSignInAt), 'MMM d, yyyy HH:mm')
})

function isSuccessMessage(msg) {
  return msg && !msg.toLowerCase().includes('could not') && !msg.toLowerCase().includes('invalid')
}

async function handleUpdateEmail() {
  const email = newEmail.value.trim()
  if (!email || email === authStore.userEmail) return

  emailLoading.value = true
  emailMessage.value = ''

  try {
    await authStore.updateEmail(email)
    emailMessage.value = 'Confirmation sent to both old and new email addresses.'
    newEmail.value = ''
  } catch (err) {
    emailMessage.value = err.message || 'Could not update email'
  } finally {
    emailLoading.value = false
  }
}

async function handleUpdatePassword() {
  if (!newPassword.value) return
  if (newPassword.value.length < 6) {
    passwordMessage.value = 'Password must be at least 6 characters'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = 'Passwords do not match'
    return
  }

  passwordLoading.value = true
  passwordMessage.value = ''

  try {
    await authStore.updatePassword(newPassword.value)
    passwordMessage.value = 'Password updated successfully.'
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    passwordMessage.value = err.message || 'Could not update password'
  } finally {
    passwordLoading.value = false
  }
}

async function handleResendVerification() {
  verifyLoading.value = true
  verifyMessage.value = ''

  try {
    await authStore.resendSignupConfirmation()
    verifyMessage.value = 'Verification email sent.'
  } catch (err) {
    verifyMessage.value = err.message || 'Could not send verification email'
  } finally {
    verifyLoading.value = false
  }
}

async function handleSignOut() {
  signOutLoading.value = true
  try {
    await authStore.signOut()
    await refreshAppData()
    router.push('/login')
  } finally {
    signOutLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-2">
      <p class="text-sm text-charcoal font-medium">{{ authStore.userEmail }}</p>
      <NotionBadge
        v-if="authStore.isEmailVerified"
        label="Verified"
        color="#d9f3e1"
      />
      <NotionBadge
        v-else
        label="Unverified"
        color="#fef7d6"
      />
    </div>

    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div v-if="memberSince">
        <dt class="text-steel">Member since</dt>
        <dd class="text-charcoal font-medium">{{ memberSince }}</dd>
      </div>
      <div v-if="lastSignIn">
        <dt class="text-steel">Last sign in</dt>
        <dd class="text-charcoal font-medium">{{ lastSignIn }}</dd>
      </div>
    </dl>

    <div v-if="!authStore.isEmailVerified" class="rounded-notion border border-hairline p-3 bg-surface/50">
      <p class="text-sm text-charcoal mb-2">Your email is not verified yet.</p>
      <NotionButton size="sm" variant="secondary" :disabled="verifyLoading" @click="handleResendVerification">
        {{ verifyLoading ? 'Sending...' : 'Resend verification email' }}
      </NotionButton>
      <p v-if="verifyMessage" class="text-sm mt-2" :class="isSuccessMessage(verifyMessage) ? 'text-success' : 'text-error'">
        {{ verifyMessage }}
      </p>
    </div>

    <div class="border-t border-hairline pt-5 space-y-4">
      <h3 class="text-sm font-semibold text-charcoal">Change email</h3>
      <form class="space-y-3" @submit.prevent="handleUpdateEmail">
        <NotionInput
          v-model="newEmail"
          label="New email"
          type="email"
          placeholder="new@example.com"
        />
        <p class="text-xs text-steel">Supabase sends a confirmation link to both addresses.</p>
        <NotionButton type="submit" variant="secondary" size="sm" :disabled="emailLoading || !newEmail.trim()">
          {{ emailLoading ? 'Updating...' : 'Update email' }}
        </NotionButton>
        <p v-if="emailMessage" class="text-sm" :class="isSuccessMessage(emailMessage) ? 'text-success' : 'text-error'">
          {{ emailMessage }}
        </p>
      </form>
    </div>

    <div class="border-t border-hairline pt-5 space-y-4">
      <h3 class="text-sm font-semibold text-charcoal">Change password</h3>
      <form class="space-y-3" @submit.prevent="handleUpdatePassword">
        <NotionInput
          v-model="newPassword"
          label="New password"
          type="password"
          placeholder="At least 6 characters"
        />
        <NotionInput
          v-model="confirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="Repeat new password"
        />
        <NotionButton type="submit" size="sm" :disabled="passwordLoading || !newPassword">
          {{ passwordLoading ? 'Updating...' : 'Update password' }}
        </NotionButton>
        <p v-if="passwordMessage" class="text-sm" :class="isSuccessMessage(passwordMessage) ? 'text-success' : 'text-error'">
          {{ passwordMessage }}
        </p>
      </form>
    </div>

    <div class="border-t border-hairline pt-5 flex flex-wrap gap-2">
      <NotionButton variant="secondary" size="sm" :disabled="signOutLoading" @click="handleSignOut">
        {{ signOutLoading ? 'Signing out...' : 'Sign out' }}
      </NotionButton>
    </div>
  </div>
</template>
