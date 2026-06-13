/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',   // Indigo
          secondary: '#8B5CF6', // Purple
          accent: '#06B6D4',    // Cyan
          success: '#10B981',
          danger: '#EF4444',
          bg: '#0F172A',        // Dark Slate
          card: '#1E293B',      // Card Slate
          text: '#F8FAFC',      // Light Slate
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
        'brand-gradient': 'linear-gradient(135deg, #6366F1, #8B5CF6, #06B6D4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'blob': 'blob 10s infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(40px, -60px) scale(1.15)',
          },
          '66%': {
            transform: 'translate(-30px, 30px) scale(0.85)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}
