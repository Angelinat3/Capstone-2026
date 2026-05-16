import colors from 'tailwindcss/colors'

const primary = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        primary,
        // Alias agar kelas `brand-*` / `surface-*` di komponen benar-benar ter-generate
        brand: primary,
        surface: colors.zinc,
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(15, 23, 42, 0.08)',
        soft: '0 2px 12px -2px rgba(15, 23, 42, 0.06)',
        nav: '0 -4px 24px -8px rgba(15, 23, 42, 0.12)',
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
}
