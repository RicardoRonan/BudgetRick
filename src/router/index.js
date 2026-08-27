import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'Sign in', public: true } },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { title: 'Create account', public: true } },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { title: 'Reset password', public: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue'), meta: { title: 'Set new password', public: true } },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Dashboard' } },
  { path: '/budget', name: 'budget', component: () => import('../views/BudgetView.vue'), meta: { title: 'Budget' } },
  { path: '/transactions', name: 'transactions', component: () => import('../views/TransactionsView.vue'), meta: { title: 'Transactions' } },
  { path: '/goals', name: 'goals', component: () => import('../views/GoalsView.vue'), meta: { title: 'Goals' } },
  { path: '/recurring', name: 'recurring', component: () => import('../views/RecurringView.vue'), meta: { title: 'Recurring' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: 'Settings' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!auth.isConfigured) return true

  if (to.meta.public) {
    if (auth.isLoggedIn && (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password')) {
      return '/'
    }
    return true
  }

  return true
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'BudgetRick'} - BudgetRick`
})

export default router
