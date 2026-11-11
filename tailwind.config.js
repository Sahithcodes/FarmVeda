/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fv: {
          main: '#0B1713',        // Main Background
          secondary: '#10251F',   // Secondary Background (Sidebar, Header, Modals)
          card: '#17332A',        // Card Background (Glassmorphism surface)
          elevated: '#1D4033',    // Elevated Surface / Card Hover
          border: '#244D3F',      // Subtle Translucent Borders
          primary: '#2E8B57',     // Primary Green
          accent: '#64D995',      // Accent Green / Glow Highlights
          textPrimary: '#F4F8F5', // Text Primary
          textSecondary: '#A9BDB1',// Text Secondary
          warning: '#F4B740',     // Warning
          critical: '#E45B5B',    // Critical
        },
        forest: {
          DEFAULT: '#1B5E36',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#1B5E36',
          950: '#0B331B',
        },
        primaryGreen: {
          DEFAULT: '#2E8B57', // Sea Green / Agricultural Green
          light: '#4CAF50',
          dark: '#1E6038',
        },
        lightGreen: {
          DEFAULT: '#E8F5E9',
          border: '#C8E6C9',
        },
        earth: {
          DEFAULT: '#8D6E45',
          light: '#B89A72',
          dark: '#5D4427',
        },
        warmCream: {
          DEFAULT: '#F7F8F0',
          card: '#FFFFFF',
          darker: '#ECEEDF',
        },
        warningAmber: {
          DEFAULT: '#F4B740',
          dark: '#D99B1E',
          light: '#FEF7E6',
        },
        criticalRed: {
          DEFAULT: '#D9534F',
          dark: '#B53B37',
          light: '#FDECEC',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans"',
          '"Noto Sans Devanagari"',
          '"Noto Sans Kannada"',
          'sans-serif',
        ],
      },
      boxShadow: {
        'farmer': '0 4px 20px -2px rgba(27, 94, 54, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'farmer-lg': '0 10px 30px -4px rgba(27, 94, 54, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'farmer-pressed': 'inset 0 2px 4px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' },
        },
        wave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
        'wave-bar': 'wave 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

