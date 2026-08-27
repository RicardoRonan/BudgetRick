import feather from 'feather-icons'

export const NAV_ICONS = {
  dashboard: 'bar-chart-2',
  budget: 'clipboard',
  transactions: 'credit-card',
  goals: 'target',
  recurring: 'repeat',
  settings: 'settings',
}

export const AVAILABLE_ICONS = [
  'activity',
  'alert-circle',
  'archive',
  'book',
  'book-open',
  'briefcase',
  'coffee',
  'credit-card',
  'dollar-sign',
  'droplet',
  'film',
  'heart',
  'home',
  'map',
  'monitor',
  'package',
  'repeat',
  'shield',
  'shopping-bag',
  'shopping-cart',
  'smartphone',
  'star',
  'tag',
  'target',
  'trending-up',
  'truck',
  'user',
  'users',
  'zap',
  'circle',
]

const EMOJI_TO_FEATHER = {
  '💰': 'dollar-sign',
  '💼': 'briefcase',
  '📈': 'trending-up',
  '💵': 'dollar-sign',
  '🏠': 'home',
  '💡': 'zap',
  '🛒': 'shopping-cart',
  '🚗': 'truck',
  '🛡️': 'shield',
  '🏥': 'activity',
  '🎬': 'film',
  '🍽️': 'coffee',
  '📱': 'smartphone',
  '👕': 'tag',
  '📚': 'book-open',
  '✨': 'star',
  '💳': 'credit-card',
  '🏦': 'archive',
  '📦': 'package',
  '📊': 'bar-chart-2',
  '📋': 'clipboard',
  '🎯': 'target',
  '🔄': 'repeat',
  '⚙️': 'settings',
}

export function normalizeIconName(icon) {
  if (!icon) return 'circle'
  if (feather.icons[icon]) return icon
  return EMOJI_TO_FEATHER[icon] || 'circle'
}

export function iconSelectOptions() {
  return AVAILABLE_ICONS.map((name) => ({ value: name, label: name.replace(/-/g, ' ') }))
}
