import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_ORIGIN || 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/media': {
        target: process.env.VITE_API_ORIGIN || 'http://127.0.0.1:4000',
        changeOrigin: true,
      },
      '/socket': {
        target: process.env.VITE_API_ORIGIN || 'http://127.0.0.1:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})

