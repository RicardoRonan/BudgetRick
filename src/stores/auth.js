import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSupabaseClient, setDataMode, isSupabaseConfigured, getCollection } from '../composables/useSupabase.js'
import { DEFAULT_CATEGORIES } from '../services/dataService.js'

function getAuthRedirectUrl(path = '/') {
  if (typeof window === 'undefined') return undefined
  return `${window.location.origin}${path}`
}

function requireSupabase() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured')
  return client
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const recoveryMode = ref(false)

  const isLoggedIn = computed(() => Boolean(user.value))
  const isConfigured = computed(() => isSupabaseConfigured())
  const userEmail = computed(() => user.value?.email ?? '')
  const isEmailVerified = computed(() => Boolean(user.value?.email_confirmed_at))
  const userCreatedAt = computed(() => user.value?.created_at ?? null)
  const lastSignInAt = computed(() => user.value?.last_sign_in_at ?? null)

  async function init() {
    if (!isSupabaseConfigured()) {
      loading.value = false
      setDataMode(true)
      return
    }

    const client = requireSupabase()
    const { data: { session } } = await client.auth.getSession()
    user.value = session?.user ?? null
    setDataMode(!session)

    client.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
      setDataMode(!session)
      recoveryMode.value = event === 'PASSWORD_RECOVERY'
    })

    loading.value = false
  }

  async function seedDefaultCategories() {
    const existing = await getCollection('categories').getFullList()
    if (existing.length > 0) return

    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const cat = DEFAULT_CATEGORIES[i]
      await getCollection('categories').create({
        ...cat,
        sort_order: i,
      })
    }
  }

  async function signUp(email, password) {
    error.value = null
    const client = requireSupabase()

    const { data, error: authError } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getAuthRedirectUrl('/') },
    })
    if (authError) throw authError

    if (data.session) {
      user.value = data.user
      setDataMode(false)
      await seedDefaultCategories()
    }

    return data
  }

  async function signIn(email, password) {
    error.value = null
    const client = requireSupabase()

    const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
    if (authError) throw authError

    user.value = data.user
    setDataMode(false)
    await seedDefaultCategories()
    return data
  }

  async function signOut() {
    error.value = null
    const client = getSupabaseClient()
    if (!client) return

    const { error: authError } = await client.auth.signOut()
    if (authError) throw authError

    user.value = null
    recoveryMode.value = false
    setDataMode(true)
  }

  async function updatePassword(password) {
    error.value = null
    const client = requireSupabase()

    const { data, error: authError } = await client.auth.updateUser({ password })
    if (authError) throw authError

    if (data.user) user.value = data.user
    recoveryMode.value = false
    return data
  }

  async function updateEmail(email) {
    error.value = null
    const client = requireSupabase()

    const { data, error: authError } = await client.auth.updateUser({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl('/settings') },
    })
    if (authError) throw authError

    if (data.user) user.value = data.user
    return data
  }

  async function resetPasswordForEmail(email) {
    error.value = null
    const client = requireSupabase()

    const { error: authError } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/reset-password'),
    })
    if (authError) throw authError
  }

  async function resendSignupConfirmation() {
    error.value = null
    const client = requireSupabase()
    if (!userEmail.value) throw new Error('No email on account')

    const { error: authError } = await client.auth.resend({
      type: 'signup',
      email: userEmail.value,
      options: { emailRedirectTo: getAuthRedirectUrl('/') },
    })
    if (authError) throw authError
  }

  return {
    user,
    loading,
    error,
    recoveryMode,
    isLoggedIn,
    isConfigured,
    userEmail,
    isEmailVerified,
    userCreatedAt,
    lastSignInAt,
    init,
    signUp,
    signIn,
    signOut,
    updatePassword,
    updateEmail,
    resetPasswordForEmail,
    resendSignupConfirmation,
    seedDefaultCategories,
  }
})
