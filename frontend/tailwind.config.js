/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        glass: 'rgba(255, 255, 255, 0.3)'
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        glow: '0 10px 40px rgba(59, 130, 246, 0.2)'
      },
      backgroundImage: {
        'gradient-hero':
          'radial-gradient(circle at top, rgba(59,130,246,0.3), transparent 55%), radial-gradient(circle at bottom, rgba(16,185,129,0.25), transparent 50%)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

