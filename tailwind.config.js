/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#ffffff',
        panel: '#ffffff',
        panel2: '#f6f7fb',
        paper: '#0b1220',
        signal: '#2f6bff',
        aqua: '#3b82f6',
        coral: '#e11d48',
        saffron: '#d97706',
        muted: '#667085',
        mist: '#f4f6fb',
        line: '#e7eaf2',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'Manrope', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        signal: '0 1px 2px rgba(15,23,42,.04), 0 16px 40px rgba(47,107,255,.10)',
        soft: '0 1px 2px rgba(15,23,42,.04), 0 10px 28px rgba(15,23,42,.06)',
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at center, rgba(47,107,255,.16) 0 1px, transparent 1.4px)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-10%)', opacity: '.15' },
          '50%': { opacity: '.45' },
          '100%': { transform: 'translateY(110%)', opacity: '.12' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.75)', opacity: '.7' },
          '100%': { transform: 'scale(1.65)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scan: 'scan 7s linear infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        marquee: 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
}
