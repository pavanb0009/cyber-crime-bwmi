/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral base with two accents only: `brand` for anything
        // interactive, `alert` reserved for 1930 and danger states.
        ink: '#ffffff',
        paper: '#101012',
        muted: '#6c6c76',
        mist: '#f7f7f8',
        line: '#e6e6e9',
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
        card: '0 1px 2px rgba(16,16,18,.03), 0 10px 30px rgba(16,16,18,.06)',
        soft: '0 1px 2px rgba(16,16,18,.04), 0 10px 28px rgba(16,16,18,.06)',
      },
    },
  },
  plugins: [],
}
