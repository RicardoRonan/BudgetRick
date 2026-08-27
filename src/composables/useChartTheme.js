import { computed } from 'vue'
import { useUiStore } from '../stores/ui.js'
import { getThemeColors, chartPalette, darkChartPalette } from '../design/colors.js'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function useChartTheme() {
  const uiStore = useUiStore()

  const isDark = computed(() => uiStore.resolvedTheme === 'dark')
  const themeColors = computed(() => getThemeColors(isDark.value))

  const palette = computed(() => (isDark.value ? darkChartPalette : chartPalette))
  const successColor = computed(() => themeColors.value.success)
  const errorColor = computed(() => themeColors.value.error)
  const successFill = computed(() => hexToRgba(themeColors.value.success, 0.15))
  const errorFill = computed(() => hexToRgba(themeColors.value.error, 0.15))
  const gridColor = computed(() => themeColors.value.hairline)
  const textColor = computed(() => themeColors.value.steel)

  return {
    isDark,
    palette,
    successColor,
    errorColor,
    successFill,
    errorFill,
    gridColor,
    textColor,
    hexToRgba,
  }
}
