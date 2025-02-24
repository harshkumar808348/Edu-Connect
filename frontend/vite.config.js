import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://edu-connect-gamma.vercel.app',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'https://edu-connect-gamma.vercel.app',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  css: {
    postcss: './postcss.config.js'
  }
})
  