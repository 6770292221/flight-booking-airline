import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.png'],

  // 👇 Fallback for SPA routing (ใช้ตอน dev เท่านั้น)
  server: {
    fs: {
      allow: ['..']
    }
  },

  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
