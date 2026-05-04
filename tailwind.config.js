/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== LEGACY (kept for backwards compatibility, do not remove) =====
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
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
          50: '#F0FDF4',
          500: '#22C55E',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          700: '#B91C1C',
        },
        sidebar: {
          DEFAULT: '#1E293B',
          hover: '#334155',
          active: '#0F172A',
        },

        // ===== STUDIO DESIGN SYSTEM (2026 redesign) =====
        // Surfaces — paper (light) / ink (dark) backgrounds
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
        // Text — neutral ink scale
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
        // Hairline borders — used as `border-edge-soft` etc.
        edge: {
          soft: 'rgba(15,15,18,0.06)',
          base: 'rgba(15,15,18,0.10)',
          strong: 'rgba(15,15,18,0.16)',
          'd-soft': 'rgba(255,255,255,0.06)',
          'd-base': 'rgba(255,255,255,0.10)',
          'd-strong': 'rgba(255,255,255,0.16)',
        },
        // Signal — single accent for CTAs, alerts, live indicators
        signal: {
          50: '#FFF1F2',
          100: '#FFE0E2',
          500: '#E11D2A',
          600: '#C7141F',
          700: '#A30F18',
          ink: '#3F0A0F',
        },
        // Quiet state colors (never primary)
        ok: '#0E8A5F',
        warn: '#B8791D',
        info: '#2563A6',
        // Stage chip colors — desaturated, all readable on paper
        stage: {
          lead: '#6B6B73',
          booked: '#2563A6',
          measurement: '#7A4FB5',
          proposal: '#B8791D',
          job: '#0E8A5F',
          invoice: '#1F8A8A',
          production: '#C7541F',
          closed: '#A0A0A8',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter Display"', 'Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', '"Geist Mono"', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Studio type scale — line-height + tracking baked in via leading/tracking utilities
        'display':    ['40px', { lineHeight: '44px', letterSpacing: '-0.03em', fontWeight: '580' }],
        'title-1':    ['28px', { lineHeight: '32px', letterSpacing: '-0.025em', fontWeight: '580' }],
        'title-2':    ['20px', { lineHeight: '26px', letterSpacing: '-0.02em', fontWeight: '580' }],
        'title-3':    ['16px', { lineHeight: '22px', letterSpacing: '-0.01em', fontWeight: '560' }],
        'body':       ['14px', { lineHeight: '22px', fontWeight: '440' }],
        'body-strong':['14px', { lineHeight: '22px', fontWeight: '540' }],
        'label':      ['12px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '500' }],
        'caption':    ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '440' }],
        'num-display':['32px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '540' }],
        'num':        ['14px', { lineHeight: '22px', fontWeight: '480' }],
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
        'ring-soft': '0 0 0 1px rgba(15,15,18,0.08)',
        'signal-ring': '0 0 0 4px rgba(225,29,42,0.16)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      transitionTimingFunction: {
        'studio-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'studio-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '320ms',
      },
      // ===== LEGACY EXTENSIONS (kept) =====
      height: {
        'topbar': '64px',
        'studio-topbar': '40px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-collapsed': '80px',
        'rail': '64px',
        'rail-expanded': '240px',
      },
      transitionProperty: {
        'width': 'width',
      },
      spacing: {
        'page': '40px',
        'gutter': '20px',
        'studio-page': '32px',
        'studio-section': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'signal-pulse': 'signalPulse 600ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        signalPulse: {
          '0%':   { boxShadow: '0 0 0 0 rgba(225,29,42,0.45)' },
          '100%': { boxShadow: '0 0 0 12px rgba(225,29,42,0)' },
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
        // Studio scrollbar — neutral, hairline
        '.scrollbar-studio': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(15,15,18,0.16) transparent',
        },
        '.dark .scrollbar-studio': {
          'scrollbar-color': 'rgba(255,255,255,0.16) transparent',
        },
        // Mono numerals — opt-in via class to apply tabular-figures
        '.num': {
          'font-family': '"Geist Mono Variable", "Geist Mono", "JetBrains Mono", ui-monospace, monospace',
          'font-variant-numeric': 'tabular-nums',
          'font-feature-settings': '"tnum" 1, "ss01" 1',
        },
      });
    },
  ],
};
