/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07100f',
        panel: '#0b1715',
        panel2: '#10211e',
        paper: '#f2f4ec',
        signal: '#c7ff67',
        aqua: '#72e5df',
        coral: '#ff7569',
        saffron: '#ffb45f',
        muted: '#9bb0aa',
      },
      fontFamily: {
        sans: ['Manrope Variable', 'Manrope', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'signal': '0 0 0 1px rgba(199,255,103,.2), 0 24px 80px rgba(0,0,0,.35)',
        'soft': '0 18px 50px rgba(0,0,0,.22)',
      },
      backgroundImage: {
        'radial-grid': 'radial-gradient(circle at center, rgba(255,255,255,.10) 0 1px, transparent 1.4px)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-10%)', opacity: '.15' },
          '50%': { opacity: '.5' },
          '100%': { transform: 'translateY(110%)', opacity: '.12' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.75)', opacity: '.8' },
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
