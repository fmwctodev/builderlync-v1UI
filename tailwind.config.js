/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          sidebar: 'rgb(24, 28, 36)',
          main: 'rgb(17, 24, 39)',
          card: 'rgb(31, 41, 55)',
          hover: 'rgb(42, 48, 65)'
        },
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          750: '#343a40',
          800: '#212529',
          900: '#16191d'
        },
        blue: {
          50: '#e7f5ff',
          100: '#d0ebff',
          200: '#a5d8ff',
          300: '#74c0fc',
          400: '#4dabf7',
          500: '#339af0',
          600: '#228be6',
          700: '#1c7ed6',
          800: '#1971c2',
          900: '#1864ab'
        },
        green: {
          50: '#ebfbee',
          100: '#d3f9d8',
          200: '#b2f2bb',
          300: '#8ce99a',
          400: '#69db7c',
          500: '#51cf66',
          600: '#40c057',
          700: '#37b24d',
          800: '#2f9e44',
          900: '#2b8a3e'
        },
        red: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#fa5252',
          700: '#f03e3e',
          800: '#e03131',
          900: '#c92a2a'
        },
        purple: {
          50: '#f8f0fc',
          100: '#f3d9fa',
          200: '#eebefa',
          300: '#e599f7',
          400: '#da77f2',
          500: '#cc5de8',
          600: '#be4bdb',
          700: '#ae3ec9',
          800: '#9c36b5',
          900: '#862e9c'
        }
      },
      boxShadow: {
        'elevation-1': '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
        'elevation-2': '0 8px 12px -2px rgba(0, 0, 0, 0.25)',
        'elevation-3': '0 12px 16px -4px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0 16px 24px -6px rgba(0, 0, 0, 0.35)',
        'elevation-5': '0 20px 28px -8px rgba(0, 0, 0, 0.4)'
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      }
    }
  },
  plugins: []
};