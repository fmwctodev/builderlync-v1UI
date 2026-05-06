import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['html2pdf.js'],
  },
  build: {
    // Generous warning threshold — we split heavy vendors below, but the
    // app surface itself is large (17 modules, ~80 pages).
    chunkSizeWarningLimit: 1500,
    commonjsOptions: {
      include: [/html2pdf\.js/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Manual vendor chunking — splits heavy 3rd-party libs out of
        // the main bundle so first-paint downloads less code, and the
        // PDF/charting/canvassing libs only load when the relevant
        // modules are visited.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;

          // PDF generation pipeline (Proposals, ContractPreview)
          if (
            id.includes('jspdf') ||
            id.includes('html2pdf.js') ||
            id.includes('html2canvas') ||
            id.includes('purify.es')
          ) {
            return 'vendor-pdf';
          }

          // Mapbox bundle (Storm Canvassing only)
          if (id.includes('mapbox-gl')) {
            return 'vendor-mapbox';
          }

          // Charting (Reporting + Marketing dashboards)
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }

          // Drag-and-drop (Jobs board, Pipeline)
          if (id.includes('@hello-pangea/dnd')) {
            return 'vendor-dnd';
          }

          // Animation
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          // Icon library — pulled into nearly every component
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // Auth + RTK + axios — used everywhere, keep in one shared
          // vendor chunk so they share a cache entry across navigations.
          if (
            id.includes('@reduxjs/toolkit') ||
            id.includes('react-redux') ||
            id.includes('@supabase/supabase-js') ||
            id.includes('axios') ||
            id.includes('posthog-js') ||
            id.includes('@headlessui/react') ||
            id.includes('react-router')
          ) {
            return 'vendor-core';
          }

          // React itself — separate so it caches independently when
          // we bump app code.
          if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler/')) {
            return 'vendor-react';
          }

          // Everything else from node_modules → generic vendor bucket
          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'html2pdf.js': 'html2pdf.js/dist/html2pdf.bundle.min.js',
    },
  },
})
