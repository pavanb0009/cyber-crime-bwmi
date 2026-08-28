/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // `black` is the foreground so existing text-black / border-black
        // utilities flip with the theme. `white` stays true white for
        // contrast on brand and alert surfaces.
        black: 'rgb(var(--c-black) / <alpha-value>)',
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        mist: 'rgb(var(--c-mist) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        card: 'rgb(var(--c-card) / <alpha-value>)',
        field: 'rgb(var(--c-field) / <alpha-value>)',
        fieldBorder: 'rgb(var(--c-field-border) / <alpha-value>)',
        ink: '#ffffff',
        brand: '#1668cf',
        brandDark: '#114f9e',
        alert: '#c8102e',
        alertDark: '#a50d26',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'Manrope', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        soft: 'var(--shadow-soft)',
      },
    },
  },
  plugins: [],
}
