/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Minimalist Black & White palette mapped to existing tokens
        navy: {
          950: '#000000', // Pure minimal black
          900: '#09090b', // Deep zinc surface
          850: '#121214', // Slightly lighter dark surface
          800: '#1f1f23', // Subtle border / card divider
          750: '#27272a', // Zinc 800
          700: '#3f3f46', // Zinc 700
          600: '#52525b', // Zinc 600
          500: '#71717a', // Zinc 500
          400: '#a1a1aa', // Zinc 400
          300: '#d4d4d8', // Zinc 300
          200: '#e4e4e7', // Zinc 200
          100: '#f4f4f5', // Zinc 100
          50: '#fafafa',  // Pure white-adjacent
        },
        // Monochrome Brand tokens (Crisp White & Minimal Gray)
        brand: {
          50: '#18181b',
          100: '#27272a',
          200: '#52525b',
          300: '#d4d4d8',
          400: '#ffffff',
          500: '#ffffff',
          600: '#e4e4e7',
          700: '#d4d4d8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': 'none',
        'glow-rose': 'none',
        'glow-emerald': 'none',
        'surface': '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
