import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
    commonjsOptions: {
      include: [/html2pdf\.js/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      'html2pdf.js': 'html2pdf.js/dist/html2pdf.bundle.min.js',
    },
  },
})
