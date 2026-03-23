import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      'dexie': path.resolve(__dirname, 'node_modules/dexie/dist/dexie.mjs'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['dexie'],
  },
})
