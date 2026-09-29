/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Master Product Design Tokens
        brand: {
          green: '#16A34A',      // Primary green
          'green-hover': '#15803D', // Hover green
          'green-light': '#F0FDF4', // Light green background
        },
        neutral: {
          900: '#111111', // Primary text
          600: '#666666', // Secondary text
          400: '#888888', // Muted text
          200: '#E5E5E5', // Borders
          50: '#FAFFA',   // Light slate
        },
        // Severe weather semantic data colors (used ONLY for weather data / maps)
        weather: {
          clear: '#16A34A',
          moderate: '#EAB308',
          heavy: '#F97316',
          extreme: '#DC2626',
        },
        risk: {
          low: '#16A34A',
          medium: '#EAB308',
          high: '#F97316',
          critical: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
