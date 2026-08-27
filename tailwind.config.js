/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#5645d4',
        'primary-pressed': '#4534b3',
        navy: '#0a1530',
        canvas: '#ffffff',
        surface: '#f6f5f4',
        ink: '#1a1a1a',
        charcoal: '#37352f',
        steel: '#787671',
        hairline: '#e5e3df',
        'tint-peach': '#ffe8d4',
        'tint-rose': '#fde0ec',
        'tint-mint': '#d9f3e1',
        'tint-lavender': '#e6e0f5',
        'tint-sky': '#dcecfa',
        'tint-yellow': '#fef7d6',
        success: '#1aae39',
        warning: '#dd5b00',
        error: '#e03131',
      },
      borderRadius: {
        'notion-sm': '6px',
        notion: '8px',
        'notion-lg': '12px',
        'notion-xl': '16px',
      },
      fontFamily: {
        sans: ['Inter', 'Notion Sans', '-apple-system', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
