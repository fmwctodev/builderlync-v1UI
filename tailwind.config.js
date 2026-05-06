/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ====================================================================
        // Studio palette — applied app-wide. The legacy palette below is
        // remapped onto Studio tokens so existing pages pick up the new
        // look without touching their classNames.
        // ====================================================================
        paper: '#FAFAF7',
        canvas: '#0B0B0F',
        surface: {
          1: '#FFFFFF',
          2: '#F5F5F0',
          3: '#EDEDE7',
          'd-1': '#131318',
          'd-2': '#1A1A21',
          'd-3': '#22222B',
        },
        ink: {
          1: '#0F0F12',
          2: '#3F3F46',
          3: '#6B6B73',
          4: '#A0A0A8',
          'd-1': '#FAFAFA',
          'd-2': '#D4D4D8',
          'd-3': '#A0A0A8',
          'd-4': '#71717A',
        },
        edge: {
          soft:   'rgba(15,15,18,0.06)',
          base:   'rgba(15,15,18,0.10)',
          strong: 'rgba(15,15,18,0.16)',
          'd-soft':   'rgba(255,255,255,0.06)',
          'd-base':   'rgba(255,255,255,0.10)',
          'd-strong': 'rgba(255,255,255,0.16)',
        },
        signal: {
          50:  '#FFF1F2',
          100: '#FFE0E2',
          500: '#E11D2A',
          600: '#C7141F',
          700: '#A30F18',
          ink: '#3F0A0F',
        },
        stage: {
          lead:        '#6B6B73',
          booked:      '#2563A6',
          measurement: '#7A4FB5',
          proposal:    '#B8791D',
          job:         '#0E8A5F',
          invoice:     '#1F8A8A',
          production:  '#C7541F',
          closed:      '#A0A0A8',
        },
        ok:   '#0E8A5F',
        warn: '#B8791D',
        info: '#2563A6',

        // ====================================================================
        // Legacy palette — preserved so existing className references still
        // compile, but values shifted toward Studio tokens for visual unity.
        // ====================================================================
        primary: {
          50:  '#FFF1F2',
          100: '#FFE0E2',
          200: '#FFC2C7',
          300: '#FF9CA3',
          400: '#F26A75',
          500: '#E11D2A',
          600: '#C7141F',
          700: '#A30F18',
          800: '#7E0C13',
          900: '#5A0A0F',
          950: '#3F0A0F',
        },
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        success: {
          50: '#ECFDF5',
          500: '#0E8A5F',
          700: '#0A6E4C',
        },
        warning: {
          50: '#FFF8EC',
          500: '#B8791D',
          700: '#8E5C16',
        },
        error: {
          50: '#FEF2F2',
          500: '#E11D2A',
          700: '#A30F18',
        },
        sidebar: {
          DEFAULT: '#0F0F12',
          hover: '#1A1A21',
          active: '#22222B',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        'studio-1': '4px',
        'studio-2': '8px',
        'studio-3': '12px',
        'studio-4': '16px',
      },
      boxShadow: {
        's1': '0 1px 0 rgba(15,15,18,0.04), 0 1px 2px rgba(15,15,18,0.06)',
        's2': '0 4px 24px -8px rgba(15,15,18,0.10), 0 1px 0 rgba(15,15,18,0.04)',
        's3': '0 24px 48px -16px rgba(15,15,18,0.18), 0 2px 0 rgba(15,15,18,0.04)',
        'ring-soft':   '0 0 0 1px rgba(15,15,18,0.08)',
        'signal-ring': '0 0 0 4px rgba(225,29,42,0.16)',
      },
      height: {
        'topbar': '40px',
        'topbar-legacy': '64px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '64px',
        'rail': '64px',
        'rail-expanded': '240px',
      },
      maxWidth: {
        'studio-page': '1600px',
        'studio-content': '1280px',
      },
      transitionProperty: {
        'width': 'width',
      },
      spacing: {
        'page': '40px',
        'gutter': '20px',
        'studio-page': '32px',
        'studio-page-mobile': '16px',
        'studio-section': '24px',
      },
      transitionTimingFunction: {
        'studio-out':    'cubic-bezier(0.22, 1, 0.36, 1)',
        'studio-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        'studio-fast': '120ms',
        'studio-base': '200ms',
        'studio-slow': '320ms',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'studio-fade-up': 'studioFadeUp 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        studioFadeUp: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-gray-300': {
          'scrollbar-color': '#d1d5db transparent',
        },
        '.scrollbar-thumb-gray-600': {
          'scrollbar-color': '#4b5563 transparent',
        },
        '.scrollbar-track-transparent': {
          'scrollbar-track-color': 'transparent',
        },
        '.hover\\:scrollbar-thumb-gray-400:hover': {
          'scrollbar-color': '#9ca3af transparent',
        },
        '.dark\\:hover\\:scrollbar-thumb-gray-500:hover': {
          'scrollbar-color': '#6b7280 transparent',
        },
        // Studio scrollbar — quieter, no track
        '.scrollbar-studio': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(15,15,18,0.16) transparent',
        },
      });
    },
  ],
};
