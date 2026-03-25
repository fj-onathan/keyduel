/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          900: '#0c0c0e',
          800: '#131112',
          700: '#1a1614',
        },
        accent: {
          DEFAULT: '#ff7a1a',
          strong: '#ffb02e',
          warm: '#ff5d2f',
        },
      },
      screens: {
        'hero': '1100px',
      },
      maxWidth: {
        '8xl': '90rem',
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 122, 26, 0.2)',
      },
    },
  },
  plugins: [],
}
