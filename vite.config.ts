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
        // Manual vendor chunking — conservative split.
        //
        // Earlier we tried a more aggressive chunking scheme (separate
        // vendor-charts / vendor-core / vendor-icons / vendor-react buckets),
        // but recharts + lodash + d3 have CJS/ESM interop expectations that
        // break when split apart from each other ("Uncaught TypeError: _ is
        // not a function" at runtime). Keeping recharts/lodash/d3/icons/etc.
        // co-located in the default vendor bundle is the safe path.
        //
        // We only split the truly-heavy, lazily-used libraries:
        //   - PDF generation pipeline (Proposals export)
        //   - Mapbox (Storm Canvassing)
        // Both are loaded only when the user visits the corresponding
        // module, so this is a real first-paint win without the interop risk.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;

          if (
            id.includes('jspdf') ||
            id.includes('html2pdf.js') ||
            id.includes('html2canvas') ||
            id.includes('purify.es')
          ) {
            return 'vendor-pdf';
          }

          if (id.includes('mapbox-gl') || id.includes('@mapbox')) {
            return 'vendor-mapbox';
          }

          // Everything else stays in the default `vendor`/main bundle —
          // safer than splitting across modules with implicit dependencies.
          return undefined;
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
