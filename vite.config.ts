import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,   // 👈 Forces Vite to use this exact port
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
