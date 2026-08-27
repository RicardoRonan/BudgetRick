export const colors = {
  primary: '#5645d4',
  primaryPressed: '#4534b3',
  navy: '#0a1530',
  canvas: '#ffffff',
  surface: '#f6f5f4',
  ink: '#1a1a1a',
  charcoal: '#37352f',
  steel: '#787671',
  hairline: '#e5e3df',
  tintPeach: '#ffe8d4',
  tintRose: '#fde0ec',
  tintMint: '#d9f3e1',
  tintLavender: '#e6e0f5',
  tintSky: '#dcecfa',
  tintYellow: '#fef7d6',
  success: '#1aae39',
  warning: '#dd5b00',
  error: '#e03131',
}

export const darkColors = {
  primary: '#7c6cf7',
  primaryPressed: '#6554e0',
  navy: '#0d0d0d',
  canvas: '#191919',
  surface: '#232323',
  ink: '#e6e6e6',
  charcoal: '#d4d4d4',
  steel: '#9b9b9b',
  hairline: '#333333',
  tintPeach: '#3d2e1e',
  tintRose: '#3d1e2e',
  tintMint: '#1e3d26',
  tintLavender: '#2e2640',
  tintSky: '#1e2e3d',
  tintYellow: '#3d3520',
  success: '#3ddc56',
  warning: '#f59e0b',
  error: '#f87171',
}

export const categoryTints = [
  colors.tintPeach,
  colors.tintRose,
  colors.tintMint,
  colors.tintLavender,
  colors.tintSky,
  colors.tintYellow,
]

export const darkCategoryTints = [
  darkColors.tintPeach,
  darkColors.tintRose,
  darkColors.tintMint,
  darkColors.tintLavender,
  darkColors.tintSky,
  darkColors.tintYellow,
]

export const chartPalette = [
  '#5645d4',
  '#1aae39',
  '#dd5b00',
  '#e03131',
  '#4534b3',
  '#787671',
  '#ffe8d4',
  '#d9f3e1',
  '#dcecfa',
  '#fde0ec',
]

export const darkChartPalette = [
  '#7c6cf7',
  '#3ddc56',
  '#f59e0b',
  '#f87171',
  '#6554e0',
  '#9b9b9b',
  '#3d2e1e',
  '#1e3d26',
  '#1e2e3d',
  '#3d1e2e',
]

export function getThemeColors(isDark) {
  return isDark ? darkColors : colors
}

const lightToDarkTint = Object.fromEntries(
  categoryTints.map((light, i) => [light.toLowerCase(), darkCategoryTints[i]])
)

export function getBadgeStyle(storedColor, isDark) {
  const normalized = (storedColor || categoryTints[3]).toLowerCase()

  if (isDark) {
    const backgroundColor = lightToDarkTint[normalized] || '#2e2640'
    return {
      backgroundColor,
      color: darkColors.ink,
    }
  }

  return {
    backgroundColor: storedColor || categoryTints[3],
    color: colors.charcoal,
  }
}
